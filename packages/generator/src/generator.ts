import { compile } from 'json-schema-to-typescript'
import { join } from 'node:path';
import {access, readFile, writeFile} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {coerce, inc, SemVer} from 'semver';

interface Dependencies {
    // the root directory of the compose-spec repository
    composeSpecRepository: string;

    composeSpecTsPackage: string;
}

export class Generator {
    readonly #schema: string;
    readonly #package: string;
    readonly #targetSpecTs: string;
    readonly #targetSpecJSON: string;

    constructor(dependencies: Dependencies) {
        // the path inside the compsose-spec repository
        this.#schema = join(dependencies.composeSpecRepository, 'schema', 'compose-spec.json');
        // files inside the compose-spec-ts package
        this.#targetSpecTs = join(dependencies.composeSpecTsPackage, 'src', 'compose-spec.ts');
        this.#targetSpecJSON = join(dependencies.composeSpecTsPackage, 'src', 'compose-spec.json');
        this.#package = join(dependencies.composeSpecTsPackage, 'package.json');
    }

    private async validate(): Promise<void> {
        // ensure the files can be accessed
        await access(this.#schema);
        await access(this.#package);
    }

    private async updatePackage(): Promise<void> {
        // Read the package.json of packages/compose-spec-ts
        let raw = await readFile(this.#package, 'utf8');

        // 2. parse the content
        let parsed = JSON.parse(raw);

        // parse the version
        const version: SemVer | null = coerce(parsed['version']);
        if(!version) throw new Error(`cannot parse compose-spec-ts version: ${parsed['version']}`);

        // increment the version
        const incremented = inc(version, 'minor');
        if(!incremented) throw new Error(`cannot increment version ${version}`);

        parsed['version'] = incremented;

        await writeFile(this.#package, JSON.stringify(parsed, null, 4));
    }

    public async generate(): Promise<void> {
        await this.validate();

        // 1. read the file content
        let raw = await readFile(this.#schema, 'utf8');

        // 2. parse the content
        let parsed = JSON.parse(raw);

        const compiled = await compile(parsed, parsed['id']);

        // write the types in a .ts file
        await writeFile(
            this.#targetSpecTs,
            compiled,
        );

        // write the json content in a .json file
        await writeFile(
            this.#targetSpecJSON,
            raw,
        );

        await this.updatePackage();
    }
}
