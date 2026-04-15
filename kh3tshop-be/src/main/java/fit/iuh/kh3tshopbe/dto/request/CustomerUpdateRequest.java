package fit.iuh.kh3tshopbe.dto.request;
import fit.iuh.kh3tshopbe.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;
import java.util.Date;

@Data
public class CustomerUpdateRequest {
    // 💡 SỬA: Dùng Integer thay vì int để cho phép giá trị null
    @NotNull(message = "Customer ID is required")
    private Integer id;

    @NotBlank(message = "Full Name cannot be blank")
    private String fullName;

    @NotBlank(message = "Phone Number cannot be blank")
    private String phoneNumber;

    // 💡 Cần có giá trị email (thường là username) khi cập nhật profile
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    private String avatar;
    private Gender gender;
    
    @Past(message = "Date of Birth must be in the past")
    private Date dateOfBirth;
    
    // 💡 Verification code khi thay đổi email
    private String emailVerificationCode;
}