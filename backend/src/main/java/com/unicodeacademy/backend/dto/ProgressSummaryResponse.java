package com.unicodeacademy.backend.dto;

import java.util.List;

public class ProgressSummaryResponse {
    private List<CourseProgressSummaryItem> courses;
    private ProgressSummaryTotals totals;

    public ProgressSummaryResponse() {
    }

    public ProgressSummaryResponse(List<CourseProgressSummaryItem> courses, ProgressSummaryTotals totals) {
        this.courses = courses;
        this.totals = totals;
    }

    public List<CourseProgressSummaryItem> getCourses() {
        return courses;
    }

    public void setCourses(List<CourseProgressSummaryItem> courses) {
        this.courses = courses;
    }

    public ProgressSummaryTotals getTotals() {
        return totals;
    }

    public void setTotals(ProgressSummaryTotals totals) {
        this.totals = totals;
    }
}
