export function getErrorMessage(err: unknown, fallback: string) {
  if (!err || typeof err !== "object") {
    return fallback;
  }

  const maybeErr = err as {
    message?: unknown;
    response?: {
      data?: unknown;
    };
  };

  const responseData = maybeErr.response?.data;
  if (typeof responseData === "object" && responseData !== null) {
    const message = (responseData as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (typeof maybeErr.message === "string" && maybeErr.message.trim()) {
    return maybeErr.message;
  }

  return fallback;
}

