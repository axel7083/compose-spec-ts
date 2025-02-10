import { Generator } from "./generator.js";
import { join } from 'node:path';

function getWorkspaceRoot(): string {
    // we are in packages/generator/src/
    return join('..', '..', '..');
}

async function main(): Promise<void> {
    // Get the workspace root directory
    const workspaceRoot = getWorkspaceRoot();

    const generator = new Generator({
        composeSpecRepository: join(workspaceRoot, 'compose-spec'),
        composeSpecTsPackage: join(workspaceRoot, 'packages', 'compose-spec-ts'),
    });
    await generator.generate();
}

main().catch(console.error);