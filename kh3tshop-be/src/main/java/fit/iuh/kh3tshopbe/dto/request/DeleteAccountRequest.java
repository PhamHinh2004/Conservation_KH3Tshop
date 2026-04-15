package fit.iuh.kh3tshopbe.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteAccountRequest {
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
}
