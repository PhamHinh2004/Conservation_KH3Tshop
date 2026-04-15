package fit.iuh.kh3tshopbe.service;

import fit.iuh.kh3tshopbe.dto.request.CustomerRequest;
import fit.iuh.kh3tshopbe.dto.request.CustomerUpdateRequest;
import fit.iuh.kh3tshopbe.dto.request.EmailVerificationCodeRequest;
import fit.iuh.kh3tshopbe.dto.response.CustomerResponse;
import fit.iuh.kh3tshopbe.entities.Customer;
import fit.iuh.kh3tshopbe.enums.Status;
import fit.iuh.kh3tshopbe.exception.AppException;
import fit.iuh.kh3tshopbe.exception.ErrorCode;
import fit.iuh.kh3tshopbe.mapper.CustomerMapper;
import fit.iuh.kh3tshopbe.repository.CustomerRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerService {
    CustomerRepository customerRepository;
    CustomerMapper customerMapper;
    EmailService emailService;
    
    // Lưu verification code tạm thời: key = "customerId:newEmail", value = code
    private static final ConcurrentHashMap<String, VerificationCodeData> verificationCodes = new ConcurrentHashMap<>();
    private static final long VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
    
    public static class VerificationCodeData {
        public String code;
        public long expiresAt;
        public boolean verified;
        
        public VerificationCodeData(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
            this.verified = false;
        }
    }
    public Customer saveCustomer(CustomerRequest customerRequest){
        System.out.println("Saving customer: " + customerRequest.getFullName());
        Customer customer = customerMapper.toCustomer(customerRequest);
        customer.setCreateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        customer.setUpdateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        customer.setStatus(Status.ACTIVE);
        return customerRepository.save(customer);
    }

    public Customer getCustomerByEmail(String email){
        return customerRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmail(email);
    }


    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toCustomerResponse)
                .toList();
    }
    @Transactional
    public CustomerResponse updateCustomerProfile(CustomerUpdateRequest request) {
        Customer existingCustomer = customerRepository.findById(request.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. Nếu email thay đổi, phải kiểm tra xác thực
        if (!existingCustomer.getEmail().equals(request.getEmail())) {
            // Email đã được kiểm tra tồn tại trong sendEmailVerificationCode
            // Nhưng kiểm tra lại để chắc chắn
            if (existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
            
            // Kiểm tra code xác thực được cung cấp
            if (request.getEmailVerificationCode() == null || request.getEmailVerificationCode().trim().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_OTP);
            }
            
            // Xác minh code hoặc trạng thái đã được xác thực trước đó
            EmailVerificationCodeRequest verifyRequest = new EmailVerificationCodeRequest();
            verifyRequest.setCustomerId(request.getId());
            verifyRequest.setNewEmail(request.getEmail());
            verifyRequest.setVerificationCode(request.getEmailVerificationCode());
            verifyEmailCode(verifyRequest);
        }

        // 2. Cập nhật các trường
        existingCustomer.setFullName(request.getFullName());
        existingCustomer.setPhoneNumber(request.getPhoneNumber());
        existingCustomer.setEmail(request.getEmail());
        existingCustomer.setAvatar(request.getAvatar());
        existingCustomer.setGender(request.getGender());
        existingCustomer.setDateOfBirth(request.getDateOfBirth());
        existingCustomer.setUpdateAt(new Date());

        // 3. Lưu vào database
        Customer updatedCustomer = customerRepository.save(existingCustomer);

        // 4. Xóa mã xác thực đã sử dụng nếu có
        String verificationKey = request.getId() + ":" + request.getEmail();
        verificationCodes.remove(verificationKey);

        // 5. Trả về Response
        return customerMapper.toCustomerResponse(updatedCustomer);
    }

    private void removeVerificationCode(Integer customerId, String newEmail) {
        verificationCodes.remove(customerId + ":" + newEmail);
    }


    public List<Customer> getAll() {
        return customerRepository.findAll();
    }


    public CustomerResponse getCurrentCustomerProfile(int customerId) {
        Customer customer = customerRepository.findById(customerId);

        return customerMapper.toCustomerResponse(customer);
    }



    public CustomerResponse getCustomerById(int id) {
        Customer customer = customerRepository.findById(id);

        return customerMapper.toCustomerResponse(customer);
    }

    public Customer getCustomerEntityById(int id) {
        return customerRepository.findById(id);
    }
    
    // ============ EMAIL VERIFICATION METHODS ============
    
    /**
     * Generate 6-digit verification code và gửi qua email
     */
    public void sendEmailVerificationCode(Integer customerId, String newEmail) {
        // Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Kiểm tra email mới không trùng với email cũ
        if (customer.getEmail().equals(newEmail)) {
            throw new AppException(ErrorCode.UnknownError); // Email không thay đổi
        }
        
        // Kiểm tra email mới có tồn tại không
        if (existsByEmail(newEmail)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        
        // Tạo mã xác thực 6 chữ số
        String code = String.format("%06d", new Random().nextInt(999999));
        
        // Lưu code vào memory cache với TTL 10 minutes
        String key = customerId + ":" + newEmail;
        verificationCodes.put(key, new VerificationCodeData(code, System.currentTimeMillis() + VERIFICATION_CODE_EXPIRY));
        
        // Gửi email
        String emailContent = buildVerificationEmail(customer.getFullName(), code);
        emailService.sendHtmlEmail(newEmail, "KH3TShop - Xác thực địa chỉ email", emailContent);
    }
    
    /**
     * Xác minh mã verification code
     */
    public boolean verifyEmailCode(EmailVerificationCodeRequest request) {
        String key = request.getCustomerId() + ":" + request.getNewEmail();
        
        VerificationCodeData data = verificationCodes.get(key);
        if (data == null) {
            throw new AppException(ErrorCode.INVALID_OTP); // Mã không tồn tại hoặc đã hết hạn
        }
        
        // Kiểm tra mã có hết hạn không
        if (System.currentTimeMillis() > data.expiresAt) {
            verificationCodes.remove(key);
            throw new AppException(ErrorCode.INVALID_OTP); // Mã đã hết hạn
        }
        
        // Kiểm tra mã có khớp không
        if (!data.code.equals(request.getVerificationCode())) {
            throw new AppException(ErrorCode.INVALID_OTP); // Mã không đúng
        }
        
        // Đánh dấu đã xác thực, giữ code trong cache cho lần save-profile tiếp theo
        data.verified = true;
        return true;
    }
    
    private boolean isVerificationCodeVerified(Integer customerId, String newEmail, String verificationCode) {
        String key = customerId + ":" + newEmail;
        VerificationCodeData data = verificationCodes.get(key);
        if (data == null) {
            return false;
        }

        if (System.currentTimeMillis() > data.expiresAt) {
            verificationCodes.remove(key);
            return false;
        }

        return data.verified && data.code.equals(verificationCode);
    }

    /**
     * Build HTML content cho email xác thực
     */
    private String buildVerificationEmail(String customerName, String code) {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f9f9f9; border: 1px solid #e5e7eb;'>" +
                "<h2 style='color: #D72638; text-align: center;'>KH3TShop - Xác thực Email</h2>" +
                "<p style='font-size: 15px; color: #333;'>Xin chào <strong>" + customerName + "</strong>,</p>" +
                "<p style='font-size: 15px; color: #333;'>Bạn vừa yêu cầu thay đổi địa chỉ email cho tài khoản KH3TShop của bạn.</p>" +
                "<p style='font-size: 15px; color: #333;'>Mã xác thực của bạn là:</p>" +
                "<div style='text-align: center; margin: 20px 0;'>" +
                "<span style='font-size: 32px; font-weight: bold; color: #D72638; letter-spacing: 5px;'>" + code + "</span>" +
                "</div>" +
                "<p style='font-size: 13px; color: #999;'>Mã này sẽ hết hạn sau 10 phút. Nếu bạn không yêu cầu thay đổi này, vui lòng bỏ qua email này.</p>" +
                "<div style='text-align:center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;'>" +
                "<p style='font-size: 14px; color: #777;'>Cảm ơn bạn đã sử dụng KH3TShop!</p>" +
                "<p style='font-size: 13px; color: #aaa;'>© 2025 KH3TShop. Tất cả các quyền được bảo lưu.</p>" +
                "</div>" +
                "</div>";
    }
}

