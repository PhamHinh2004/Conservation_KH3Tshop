package fit.iuh.kh3tshopbe.service;

import fit.iuh.kh3tshopbe.controller.CartController;
import fit.iuh.kh3tshopbe.dto.request.AccountRequest;
import fit.iuh.kh3tshopbe.dto.response.AccountResponse;
import fit.iuh.kh3tshopbe.dto.response.CustomerResponse;
import fit.iuh.kh3tshopbe.entities.Account;
import fit.iuh.kh3tshopbe.entities.Cart;

import fit.iuh.kh3tshopbe.entities.Customer;
import fit.iuh.kh3tshopbe.enums.Role;

import fit.iuh.kh3tshopbe.enums.Status;
import fit.iuh.kh3tshopbe.enums.StatusLogin;

import fit.iuh.kh3tshopbe.exception.AppException;
import fit.iuh.kh3tshopbe.exception.ErrorCode;
import fit.iuh.kh3tshopbe.mapper.AccountMapper;
import fit.iuh.kh3tshopbe.mapper.CustomerMapper;
import fit.iuh.kh3tshopbe.repository.AccountRepository;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountService {

    AccountRepository accountRepository;
    AccountMapper accountMapper;
    PasswordEncoder passwordEncoder ;
    CustomerService customerService;
    CartService cartService;
    CustomerMapper customerMapper;
    EmailService emailService;


    public AccountResponse addAccount(AccountRequest accountRequest) {
        if(this.accountRepository.existsByUsername(accountRequest.getUsername()) ||
                customerService.existsByEmail(accountRequest.getCustomer().getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        Account account = accountMapper.toAccount(accountRequest);
        Cart cart  = new Cart();
        cart.setCreated_at(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        cart.setUpdated_at(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        cart.setTotalAmount(0.0);
        cart.setTotalQuantity(0);
        cart.setAccount(account);

        account.setPassword(passwordEncoder.encode(accountRequest.getPassword()));
        account.setRole(Role.USER);
        account.setStatusLogin(StatusLogin.ACTIVE);
        account.setCreateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        account.setUpdateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        account.setCart(cart);

        Customer customer = customerMapper.toCustomer(accountRequest.getCustomer());
        customer.setCreateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        customer.setUpdateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        customer.setStatus(Status.ACTIVE);
        account.setCustomer(customer);

        cartService.saveCart(cart);

        return  accountMapper.toAccountResponse(this.accountRepository.save(account));
    }


    public AccountResponse getAccountById(Integer id) {
        return accountMapper.toAccountResponse(this.accountRepository.findById(id).orElseThrow(() -> new RuntimeException("Account not found")));
    }

    @PreAuthorize("hasRole('ADMIN')")

    public List<AccountResponse> getAllAccounts(String name, String status, String role) {
        List<Account> accounts = accountRepository.findAll();

        return accounts.stream()
                .filter(acc -> acc.getId() != 1)
                .filter(acc -> name == null || acc.getCustomer().getFullName().toLowerCase().contains(name.toLowerCase()))
                .filter(acc -> status == null || acc.getStatusLogin().name().equals(status))
                .filter(acc -> role == null || acc.getRole().name().equals(role))
                .map(accountMapper::toAccountResponse)
                .toList();
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public AccountResponse getMyAccount(){
        var contextHolder = SecurityContextHolder.getContext();
        String username = contextHolder.getAuthentication().getName();
        Account account = this.accountRepository.findByUsername(username).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));
        return  accountMapper.toAccountResponse(account);
    }

    public AccountResponse getAccountByUsername(String username){
        Account account = this.accountRepository.findByUsername(username).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));
        return  accountMapper.toAccountResponse(account);
    }



    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse addAccountByAdmin(AccountRequest accountRequest) {
        if(this.accountRepository.existsByUsername(accountRequest.getUsername()) ||
                customerService.existsByEmail(accountRequest.getCustomer().getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        Account account = accountMapper.toAccount(accountRequest);
        Cart cart  = new Cart();
        cart.setCreated_at(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        cart.setUpdated_at(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        cart.setTotalAmount(0.0);
        cart.setTotalQuantity(0);

        account.setPassword(passwordEncoder.encode(accountRequest.getPassword()));
        account.setRole(accountRequest.getRole());
        account.setStatusLogin(StatusLogin.ACTIVE);
        account.setCreateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        account.setUpdateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        account.setCart(cart);

        Customer customer = customerMapper.toCustomer(accountRequest.getCustomer());
        customer.setCreateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        customer.setUpdateAt(Date.from(LocalDate.now().atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
        customer.setStatus(Status.ACTIVE);
        account.setCustomer(customer);

        cartService.saveCart(cart);

        return  accountMapper.toAccountResponse(this.accountRepository.save(account));
    }

    public AccountResponse updateAccountByAdmin(Integer id, AccountRequest accountRequest) {
        Account existingAccount = this.accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra trùng username
        if (!existingAccount.getUsername().equals(accountRequest.getUsername()) &&
                this.accountRepository.existsByUsername(accountRequest.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        existingAccount.setUsername(accountRequest.getUsername());
        existingAccount.setRole(accountRequest.getRole());
        existingAccount.setStatusLogin(accountRequest.getStatusLogin());
        existingAccount.setUpdateAt(new Date());

        // Xử lý password chỉ khi có gửi từ frontend
        if (accountRequest.getPassword() != null && !accountRequest.getPassword().isBlank()) {
            existingAccount.setPassword(passwordEncoder.encode(accountRequest.getPassword()));
        }

        //Cập nhật Customer
        Customer customer = existingAccount.getCustomer();
        customer.setFullName(accountRequest.getCustomer().getFullName());
        customer.setEmail(accountRequest.getCustomer().getEmail());
        customer.setPhoneNumber(accountRequest.getCustomer().getPhoneNumber());
        customer.setGender(accountRequest.getCustomer().getGender());
        customer.setDateOfBirth(accountRequest.getCustomer().getDateOfBirth());
        customer.setUpdateAt(new Date());

        existingAccount.setCustomer(customer);

        return accountMapper.toAccountResponse(accountRepository.save(existingAccount));
    }

    public AccountResponse deleteAccountByAdmin(Integer id) {
        Account existingAccount = this.accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        existingAccount.setStatusLogin(StatusLogin.LOCKED);
        existingAccount.setUpdateAt(new Date());

        return accountMapper.toAccountResponse(accountRepository.save(existingAccount));
    }

    public List<Customer> getAllEmployees() {
        return accountRepository.findByRole(Role.STAFF).stream()
                .map(Account::getCustomer)
                .toList();
    }


    public Account getAccountByAccountId(int id){
        return this.accountRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public  Account findAccountByCustomerEmail(String email){

        return this.accountRepository.findByCustomer_Email(email).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public  Account saveAccount(Account account){
        return this.accountRepository.save(account);
    }

    // OTP storage: Map<username, OtpData>
    private static final java.util.Map<String, OtpData> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();
    private static final int OTP_EXPIRY_SECONDS = 120;

    public void sendDeleteAccountOtp(String phoneNumber) {
        // Get current user
        var contextHolder = SecurityContextHolder.getContext();
        String username = contextHolder.getAuthentication().getName();
        Account account = this.accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Validate phone number matches
        if(!account.getCustomer().getPhoneNumber().equals(phoneNumber)) {
            throw new AppException(ErrorCode.INVALID_PHONE);
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));

        // Store OTP with timestamp
        otpStorage.put(username, new OtpData(otp, System.currentTimeMillis()));

        // Send OTP via email
        String subject = "XÁC NHẬN XÓA TÀI KHOẢN - KH3T SHOP";
        String content = "Mã OTP của bạn là: " + otp + "\n\nMã này sẽ hết hiệu lực sau 2 phút.\n\n" +
                "Nếu bạn không yêu cầu xóa tài khoản, vui lòng bỏ qua email này.";
        emailService.sendSimpleEmail(account.getCustomer().getEmail(), subject, content);
    }

    public void verifyAndLockAccount(String otp) {
        // Get current user
        var contextHolder = SecurityContextHolder.getContext();
        String username = contextHolder.getAuthentication().getName();
        Account account = this.accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if OTP exists and is not expired
        OtpData otpData = otpStorage.get(username);
        if(otpData == null) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        long currentTime = System.currentTimeMillis();
        long otpAge = (currentTime - otpData.timestamp) / 1000; // Convert to seconds

        if(otpAge > OTP_EXPIRY_SECONDS) {
            otpStorage.remove(username);
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Verify OTP matches
        if(!otpData.code.equals(otp)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Lock account
        account.setStatusLogin(StatusLogin.LOCKED);
        account.setUpdateAt(new Date());
        accountRepository.save(account);

        // Clear OTP
        otpStorage.remove(username);
    }

    // Inner class for OTP storage
    private static class OtpData {
        String code;
        long timestamp;

        OtpData(String code, long timestamp) {
            this.code = code;
            this.timestamp = timestamp;
        }
    }

}