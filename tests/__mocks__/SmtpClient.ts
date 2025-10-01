/**
 * Manual mock for SmtpClient to avoid ES module import issues with ky
 */

export const SmtpClient = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  postMultipart: jest.fn(),
  stream: jest.fn(),
}));