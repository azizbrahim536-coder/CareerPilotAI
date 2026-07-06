package com.aziz.careerpilot_backend.controller;



import com.aziz.careerpilot_backend.dto.UserProfileResponse;
import com.aziz.careerpilot_backend.entity.AppUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser(
            @AuthenticationPrincipal
            AppUser user
    ) {
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}