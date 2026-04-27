package com.example.backend.service;

import com.example.backend.entity.Class;
import com.example.backend.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClassService {
    @Autowired
    private ClassRepository classRepository;

    public List<Class> getAllClasses() {
        return classRepository.findAll();
    }

    public Optional<Class> getClassById(Long id) {
        return classRepository.findById(id);
    }

    public Class saveClass(Class clazz) {
        return classRepository.save(clazz);
    }

    public void deleteClass(Long id) {
        classRepository.deleteById(id);
    }
}
