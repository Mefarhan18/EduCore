package com.example.backend.service;
 
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.entity.Student;
import com.example.backend.entity.Teacher;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.Optional;
 
@Service
public class UserService {
 
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;
 
    @Autowired
    private PasswordEncoder passwordEncoder;
 
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
 
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
 
    public User saveUser(User user) {
        String normalizedUsername = user.getUsername() != null ? user.getUsername().trim() : null;
        if (normalizedUsername != null && !normalizedUsername.isEmpty()) {
            user.setUsername(normalizedUsername);
        }

        User existingUser = null;
        if (user.getId() != null) {
            existingUser = userRepository.findById(user.getId()).orElse(null);
        } else if (normalizedUsername != null) {
            existingUser = userRepository.findByUsername(normalizedUsername).orElse(null);
        }

        User managedUser = existingUser != null ? existingUser : user;

        if (existingUser != null) {
            if (user.getUsername() != null) {
                managedUser.setUsername(user.getUsername());
            }
            if (user.getRole() != null) {
                managedUser.setRole(user.getRole());
            }
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                managedUser.setPassword(encodePassword(user.getPassword()));
            }
        } else if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            managedUser.setPassword(encodePassword(user.getPassword()));
        }

        User savedUser = userRepository.save(managedUser);

        // Auto-create Student profile if role is STUDENT and profile does not exist
        if (savedUser.getRole() == Role.STUDENT) {
            if (studentRepository.findByUserId(savedUser.getId()).isEmpty()) {
                Student student = new Student();
                student.setUser(savedUser);
                student.setName(savedUser.getUsername());
                student.setRollNo(savedUser.getUsername());
                studentRepository.save(student);
            }
        }
        // Auto-create Teacher profile if role is TEACHER and profile does not exist
        else if (savedUser.getRole() == Role.TEACHER) {
            if (teacherRepository.findByUserId(savedUser.getId()).isEmpty()) {
                Teacher teacher = new Teacher();
                teacher.setUser(savedUser);
                teacher.setName(savedUser.getUsername());
                String email = savedUser.getUsername();
                if (!email.contains("@")) {
                    email = email + "@school.com";
                }
                teacher.setEmail(email);
                teacherRepository.save(teacher);
            }
        }

        return savedUser;
    }

    private String encodePassword(String password) {
        if (password == null || password.isEmpty()) {
            return password;
        }
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$")
                ? password
                : passwordEncoder.encode(password);
    }
 
    public void deleteUser(Long id) {
        studentRepository.findByUserId(id).ifPresent(student -> studentRepository.delete(student));
        teacherRepository.findByUserId(id).ifPresent(teacher -> teacherRepository.delete(teacher));
        userRepository.deleteById(id);
    }
}
