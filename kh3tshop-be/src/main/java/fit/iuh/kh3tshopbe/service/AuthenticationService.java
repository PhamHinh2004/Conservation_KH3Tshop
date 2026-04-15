package fit.iuh.kh3tshopbe.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import fit.iuh.kh3tshopbe.dto.request.AuthenticationRequest;
import fit.iuh.kh3tshopbe.dto.request.IntrospectRequest;
import fit.iuh.kh3tshopbe.dto.response.AuthenticationResponse;
import fit.iuh.kh3tshopbe.dto.response.IntrospectResponse;
import fit.iuh.kh3tshopbe.entities.Account;
import fit.iuh.kh3tshopbe.entities.Customer;
import fit.iuh.kh3tshopbe.enums.StatusLogin;
import fit.iuh.kh3tshopbe.exception.AppException;
import fit.iuh.kh3tshopbe.exception.ErrorCode;
import fit.iuh.kh3tshopbe.repository.AccountRepository;
import fit.iuh.kh3tshopbe.repository.CustomerRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    AccountRepository accountRepository;
    PasswordEncoder passwordEncoder;
    EmailService emailService;
    CustomerRepository customerRepository;

    // ================== 🔥 SECRET KEY ==================
    private static final String SIGNER_KEY =
            "c8e09fddda9e192d16c485affabc61c9f4bca77a60c19d448f3a6e8475b9f0a4e0d1f69bca8d21f1123b8f0f8a0b8d12";

    // ================== 🔥 INTROSPECT ==================
    public IntrospectResponse introspecct(IntrospectRequest request) throws JOSEException, ParseException {

        String token = request.getToken();

        SignedJWT signedJWT = SignedJWT.parse(token);
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        boolean verified = signedJWT.verify(verifier);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        String username = signedJWT.getJWTClaimsSet().getSubject();
        String sessionToken = (String) signedJWT.getJWTClaimsSet().getClaim("sessionToken");

        // 🔥 CHECK SESSION TOKEN TRONG DB
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean validSession =
                sessionToken != null &&
                        account.getSessionToken() != null &&
                        sessionToken.equals(account.getSessionToken());

        return IntrospectResponse.builder()
                .valid(verified && expiryTime.after(new Date()) && validSession)
                .build();
    }

    // ================== 🔥 LOGIN ==================
    public AuthenticationResponse authenticate(AuthenticationRequest request){

        Account user = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // ❌ CHECK LOCK
        if (user.getStatusLogin() == StatusLogin.LOCKED) {
            throw new AppException(ErrorCode.User_Not_Authenticated);
        }

        // ❌ CHECK PASSWORD
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.Password_Failed);
        }

        // 🔥 QUAN TRỌNG: mỗi lần login tạo session mới
        String sessionToken = UUID.randomUUID().toString();
        user.setSessionToken(sessionToken);

        accountRepository.save(user);

        String token = generateToken(user, sessionToken);

        return AuthenticationResponse.builder()
                .isAuthenticated(true)
                .token(token)
                .build();
    }

    // ================== 🔥 SEND OTP ==================
    public void sendOTP(String username) {

        Account user = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Customer customer = customerRepository.findByAccount(user)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        String otp = String.format("%06d", new Random().nextInt(999999));

        user.setOtp(otp);
        user.setOtpExpiry(Date.from(Instant.now().plus(2, ChronoUnit.MINUTES)));

        accountRepository.save(user);

        emailService.sendSimpleEmail(
                customer.getEmail(),
                "OTP mở khóa tài khoản",
                "Mã OTP của bạn là: " + otp
        );
    }

    // ================== 🔥 VERIFY OTP ==================
    public void verifyOTP(String username, String otpInput) {

        Account user = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        if (!user.getOtp().equals(otpInput)
                || user.getOtpExpiry().before(new Date())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        user.setStatusLogin(StatusLogin.ACTIVE);
        user.setOtp(null);
        user.setOtpExpiry(null);

        accountRepository.save(user);
    }

    // ================== 🔥 GENERATE TOKEN ==================
    private String generateToken(Account account, String sessionToken) {
        try {
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(account.getUsername())
                    .issuer("kh3t-shop")
                    .issueTime(new Date())
                    .expirationTime(new Date(
                            Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                    ))
                    .claim("scope", account.getRole().toString())
                    .claim("sessionToken", sessionToken) // 🔥 CHỐT
                    .build();

            JWSObject jwsObject = new JWSObject(header, new Payload(claimsSet.toJSONObject()));

            jwsObject.sign(new MACSigner(SIGNER_KEY));

            return jwsObject.serialize();

        } catch (Exception e) {
            throw new AppException(ErrorCode.Token_Generation_Failed);
        }
    }
}