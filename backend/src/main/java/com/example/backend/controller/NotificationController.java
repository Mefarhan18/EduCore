package com.example.backend.controller;

import com.example.backend.entity.Notification;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.example.backend.repository.UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN') or hasRole('PARENT')")
    public List<Notification> getMyNotifications() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return notificationService.getNotificationsByUserId(userDetails.getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.createNotification(notification);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendBulkNotification(@RequestBody java.util.Map<String, Object> payload) {
        List<Integer> userIds = (List<Integer>) payload.get("userIds");
        String title = (String) payload.get("title");
        String message = (String) payload.get("message");
        String typeStr = (String) payload.get("type");
        
        Notification.NotificationType type = Notification.NotificationType.valueOf(typeStr);
        
        for (Integer userId : userIds) {
            Notification notification = new Notification();
            com.example.backend.entity.User user = userRepository.findById(userId.longValue()).orElse(null);
            if (user != null) {
                notification.setUser(user);
                notification.setTitle(title);
                notification.setMessage(message);
                notification.setType(type);
                notificationService.createNotification(notification);
            }
        }
        
        return ResponseEntity.ok().build();
    }
}
