package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "results")
@Data
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Subject subject;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marks;

    private String grade;

    @Column(name = "exam_term")
    private String examTerm;

    @Transient
    private BigDecimal gpa;

    @Transient
    private String status;

    @PostLoad
    @PrePersist
    @PreUpdate
    private void calculateTransientFields() {
        if (marks != null) {
            // Status: PASS if >= 40
            this.status = marks.compareTo(new BigDecimal("40")) >= 0 ? "PASS" : "FAIL";

            // GPA out of 4.0
            if (marks.compareTo(new BigDecimal("90")) >= 0) {
                this.gpa = new BigDecimal("4.0");
                if (grade == null || grade.isEmpty()) this.grade = "A+";
            } else if (marks.compareTo(new BigDecimal("80")) >= 0) {
                this.gpa = new BigDecimal("4.0");
                if (grade == null || grade.isEmpty()) this.grade = "A";
            } else if (marks.compareTo(new BigDecimal("70")) >= 0) {
                this.gpa = new BigDecimal("3.0");
                if (grade == null || grade.isEmpty()) this.grade = "B";
            } else if (marks.compareTo(new BigDecimal("60")) >= 0) {
                this.gpa = new BigDecimal("2.0");
                if (grade == null || grade.isEmpty()) this.grade = "C";
            } else if (marks.compareTo(new BigDecimal("50")) >= 0) {
                this.gpa = new BigDecimal("1.0");
                if (grade == null || grade.isEmpty()) this.grade = "D";
            } else {
                this.gpa = new BigDecimal("0.0");
                if (grade == null || grade.isEmpty()) this.grade = "F";
            }
        }
    }
}
