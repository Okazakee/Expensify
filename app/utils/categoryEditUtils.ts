export const generateUniqueId = (): string => {
  // Current timestamp
  const timestamp = Date.now().toString();

  // Generate a random string to add uniqueness
  const randomPart = Math.random().toString(36).substring(2, 9);

  // Combine timestamp and random part
  return `${timestamp}-${randomPart}`;
};

export default generateUniqueId;