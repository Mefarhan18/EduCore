package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "parents")
@Data
public class Parent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    private String contact;
    private String address;

    @OneToMany(mappedBy = "parent")
    private Set<Student> students;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
