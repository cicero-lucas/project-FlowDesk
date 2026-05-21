package com.flowdesk.api.dto;

import com.flowdesk.api.model.Comment;

import java.time.LocalDateTime;

public record CommentResponse(Long id, String content, UserResponse author, LocalDateTime createdAt) {

    public static CommentResponse from(Comment comment) {
        return new CommentResponse(comment.getId(), comment.getContent(),
                UserResponse.from(comment.getAuthor()), comment.getCreatedAt());
    }
}
