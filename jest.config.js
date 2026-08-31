/** Unit-тесты: только содержательная логика сервисов и доменных функций. */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  // rootDir — корень проекта, чтобы ts-jest нашёл рядом с собой тот же
  // tsconfig.json, что и tsc: иначе он молча уезжает на собственные
  // умолчания с другим разрешением модулей.
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
