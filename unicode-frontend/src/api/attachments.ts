import { http } from "./http";

export type CourseAttachmentDto = {
  id: number;
  courseId: number;
  originalName: string;
  sizeBytes: number;
  uploadedAt: string;
};

export async function getCourseAttachments(courseId: number): Promise<CourseAttachmentDto[]> {
  const res = await http.get<CourseAttachmentDto[]>(`/api/courses/${courseId}/attachments`);
  return res.data;
}

export async function uploadCourseAttachment(courseId: number, file: File): Promise<CourseAttachmentDto> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await http.post<CourseAttachmentDto>(
    `/api/admin/courses/${courseId}/attachments`,
    formData,
    {
      transformRequest: (data) => data,
      headers: { "Content-Type": undefined as unknown as string },
    }
  );
  return res.data;
}

export async function deleteCourseAttachment(courseId: number, attachmentId: number): Promise<void> {
  await http.delete(`/api/admin/courses/${courseId}/attachments/${attachmentId}`);
}

export async function downloadCourseAttachment(courseId: number, attachmentId: number, originalName: string): Promise<void> {
  const res = await http.get(`/api/courses/${courseId}/attachments/${attachmentId}/download`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = originalName || "attachment";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

