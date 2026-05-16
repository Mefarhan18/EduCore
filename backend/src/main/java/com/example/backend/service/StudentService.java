// package com.example.backend.service;

// import com.example.backend.entity.Student;
// import com.example.backend.repository.StudentRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.Optional;

// @Service
// public class StudentService {
//     @Autowired
//     private StudentRepository studentRepository;

//     public List<Student> getAllStudents() {
//         return studentRepository.findAll();
//     }

//     public Optional<Student> getStudentById(Long id) {
//         return studentRepository.findById(id);
//     }

//     public Optional<Student> getStudentByUserId(Long userId) {
//         return studentRepository.findByUserId(userId);
//     }

//     public Student saveStudent(Student student) {
//         return studentRepository.save(student);
//     }

//     public void deleteStudent(Long id) {
//         studentRepository.deleteById(id);
//     }
// }

package com.example.backend.service;

import com.example.backend.entity.Role;
import com.example.backend.entity.Student;
import com.example.backend.entity.User;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Page<Student> searchStudents(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return studentRepository.findAll(pageable);
        }
        return studentRepository.findByNameContainingIgnoreCaseOrRollNoContainingIgnoreCase(keyword, keyword, pageable);
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId);
    }

    public Student saveStudent(Student student) {

        // Create login account for student
        User user = new User();

        // Username = Roll Number
        user.setUsername(student.getRollNo());

        // Default password
        user.setPassword(passwordEncoder.encode("student123"));

        // Assign student role
        user.setRole(Role.STUDENT);

        // Save user
        userRepository.save(user);

        // Link user to student
        student.setUser(user);

        // Save student
        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}
