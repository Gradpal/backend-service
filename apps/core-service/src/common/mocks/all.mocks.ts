export const MINIO_PROPERTIES_MOCK = {
  minioEndPoint: 'localhost',
  minioPort: '9000',
  minioUsessl: 'false',
  minioAccessKey: 'test-access-key',
  minioSecretKey: 'test-secret-key',
  minioBucket: 'test-bucket',
  getStripeSecretKey: jest.fn().mockReturnValue('sk_test_1234567890'),
};
