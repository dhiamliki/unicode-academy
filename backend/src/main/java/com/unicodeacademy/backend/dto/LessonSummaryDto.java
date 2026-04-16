package com.unicodeacademy.backend.dto;

public class LessonSummaryDto {
    private Long id;
    private String title;
    private String type;
    private Integer orderIndex;

    public LessonSummaryDto() {
    }

    public LessonSummaryDto(Long id, String title, String type, Integer orderIndex) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.orderIndex = orderIndex;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}
