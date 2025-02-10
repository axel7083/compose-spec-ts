import { Generator } from "./generator.js";
import { writeFile } from 'node:fs/promises';
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
    });
    const result = await generator.generate();

    return await writeFile(
        // write the result in packages/compose-spec-ts/src/compose-spec.d.ts
        join(workspaceRoot, 'packages', 'compose-spec-ts', 'src', 'compose-spec.d.ts'),
        result,
    );
}

main().catch(console.error);