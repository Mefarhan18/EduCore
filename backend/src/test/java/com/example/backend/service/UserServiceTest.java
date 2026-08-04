package com.example.backend.service;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void saveUser_shouldUpdateExistingUsernameInsteadOfCreatingDuplicateUser() {
        User firstUser = new User();
        firstUser.setUsername("alice");
        firstUser.setPassword("raw-pass");
        firstUser.setRole(Role.STUDENT);

        User savedFirstUser = userService.saveUser(firstUser);

        User duplicateUser = new User();
        duplicateUser.setUsername("alice");
        duplicateUser.setPassword("new-pass");
        duplicateUser.setRole(Role.TEACHER);

        User updatedUser = userService.saveUser(duplicateUser);

        assertThat(updatedUser.getId()).isEqualTo(savedFirstUser.getId());
        assertThat(userRepository.findAll()).hasSize(1);
        assertThat(userRepository.findByUsername("alice")).isPresent();
        assertThat(userRepository.findByUsername("alice").get().getRole()).isEqualTo(Role.TEACHER);
        assertThat(userRepository.findByUsername("alice").get().getPassword()).isNotEqualTo("new-pass");
    }
}
