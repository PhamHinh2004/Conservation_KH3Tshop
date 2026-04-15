package fit.iuh.kh3tshopbe.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "OTP is required")
    private String otp;
}
