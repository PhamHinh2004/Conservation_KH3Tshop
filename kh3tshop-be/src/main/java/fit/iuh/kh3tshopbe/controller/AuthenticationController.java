package fit.iuh.kh3tshopbe.controller;

import com.nimbusds.jose.JOSEException;
import fit.iuh.kh3tshopbe.configuration.JwtUtil;
import fit.iuh.kh3tshopbe.dto.ResetPassword.ForgotPasswordRequest;
import fit.iuh.kh3tshopbe.dto.ResetPassword.ResetPasswordRequest;
import fit.iuh.kh3tshopbe.dto.request.AuthenticationRequest;
import fit.iuh.kh3tshopbe.dto.request.IntrospectRequest;
import fit.iuh.kh3tshopbe.dto.response.ApiResponse;
import fit.iuh.kh3tshopbe.dto.response.AuthenticationResponse;
import fit.iuh.kh3tshopbe.dto.response.IntrospectResponse;
import fit.iuh.kh3tshopbe.entities.Account;
import fit.iuh.kh3tshopbe.exception.AppException;
import fit.iuh.kh3tshopbe.exception.ErrorCode;
import fit.iuh.kh3tshopbe.service.AccountService;
import fit.iuh.kh3tshopbe.service.AuthenticationService;

import io.jsonwebtoken.ExpiredJwtException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;
    AccountService accountService;
    JwtUtil jwtUtil;

    // ================= LOGIN =================
    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request){
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    // ================= SEND OTP =================
    @PostMapping("/send-otp")
    public ApiResponse<String> sendOtp(@RequestParam String username){
        authenticationService.sendOTP(username);

        return ApiResponse.<String>builder()
                .result("Gửi OTP thành công")
                .build();
    }

    // ================= VERIFY OTP =================
    @PostMapping("/verify-otp")
    public ApiResponse<String> verifyOtp(
            @RequestParam String username,
            @RequestParam String otp
    ){
        authenticationService.verifyOTP(username, otp);

        return ApiResponse.<String>builder()
                .result("Xác thực thành công - đã mở khóa")
                .build();
    }

    // ================= INTROSPECT =================
    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {

        var result = authenticationService.introspecct(request);

        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }

    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot-password")
    public ApiResponse<ResetPasswordRequest> forgotPassword(
            @RequestBody ForgotPasswordRequest forgotPasswordRequest) {

        Account account = accountService.findAccountByCustomerEmail(
                forgotPasswordRequest.getEmail()
        );

        if (account == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        String token = jwtUtil.generateResetToken(forgotPasswordRequest.getEmail());

        ResetPasswordRequest response = new ResetPasswordRequest();
        response.setToken(token);
        response.setOtp(otp);
        response.setNewPassword("");

        authenticationService.sendOTP(account.getUsername());

        return ApiResponse.<ResetPasswordRequest>builder()
                .result(response)
                .build();
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        try {
            String email = jwtUtil.extractEmail(request.getToken());

            Account account = accountService.findAccountByCustomerEmail(email);

            if (account == null) {
                return ApiResponse.<String>builder()
                        .result("Invalid token!")
                        .build();
            }

            account.setPassword(
                    new BCryptPasswordEncoder().encode(request.getNewPassword())
            );

            accountService.saveAccount(account);

            return ApiResponse.<String>builder()
                    .result("Password has been reset successfully.")
                    .build();

        } catch (ExpiredJwtException ex) {
            return ApiResponse.<String>builder()
                    .result("Token has expired!")
                    .build();

        } catch (Exception ex) {
            return ApiResponse.<String>builder()
                    .result("An error occurred while resetting the password.")
                    .build();
        }
    }
}