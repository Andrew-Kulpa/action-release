import { Artifact } from '../src/main/artifact';

const fileContents = Buffer.from('test file contents', 'utf-8');
const contentLength = 2;

jest.mock('fs', () => ({
  readFileSync: (): Buffer => fileContents,
  statSync: (): { size: number } => ({ size: contentLength }),
}));

describe('Artifact', () => {
  it('generates name from path', () => {
    const artifact = new Artifact('some/artifact');
    expect(artifact.name).toBe('artifact');
  });

  it('provides contentLength', () => {
    const artifact = new Artifact('some/artifact');
    expect(artifact.contentLength).toBe(contentLength);
  });

  it('provides path', () => {
    const artifact = new Artifact('some/artifact');
    expect(artifact.path).toBe('some/artifact');
  });

  it('reads artifact', () => {
    const artifact = new Artifact('some/artifact');
    expect(artifact.readFile()).toBe(fileContents);
  });
});
