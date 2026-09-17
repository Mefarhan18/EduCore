package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.entity.Subject;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class BackendApplication {

	@Value("${spring.datasource.username}")
	private String dbUser;

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@PostConstruct
	public void checkConfig() {
		System.out.println("====================================================================");
		System.out.println("SPRING BOOT IS CONFIGURED TO CONNECT AS USER: " + dbUser);
		System.out.println("====================================================================");
	}

	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder,
								   ClassRepository classRepository, SubjectRepository subjectRepository) {
		return args -> {
			User admin = userRepository.findByUsername("admin").orElseGet(User::new);
			boolean isNewAdmin = admin.getId() == null;
			if (isNewAdmin) {
				admin.setUsername("admin");
			}
			admin.setUsername("admin");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setRole(Role.ADMIN);
			userRepository.save(admin);
			if (isNewAdmin) {
				System.out.println("====================================================================");
				System.out.println("Admin user seeded! Login: admin / admin123");
				System.out.println("====================================================================");
			} else {
				System.out.println("Admin user credentials ensured! Login: admin / admin123");
			}

			if (classRepository.count() == 0) {
				String[][] classes = {{"10th", "A"}, {"10th", "B"}, {"9th", "A"}};
				for (String[] cls : classes) {
					com.example.backend.entity.Class newClass = new com.example.backend.entity.Class();
					newClass.setClassName(cls[0]);
					newClass.setSection(cls[1]);
					classRepository.save(newClass);
				}
				System.out.println("Default classes seeded!");
			}

			if (subjectRepository.count() == 0) {
				String[] subjects = {"Mathematics", "Science", "English", "History"};
				for (String subj : subjects) {
					Subject newSubject = new Subject();
					newSubject.setSubjectName(subj);
					subjectRepository.save(newSubject);
				}
				System.out.println("Default subjects seeded!");
			}
		};
	}
}
