/* Lets `node --test` load the app's TypeScript as Next does: `@/` is the repo
   root and imports carry no extension. Node strips the types itself, so the
   suite needs no test framework. Pure modules only: nothing here reads JSX or
   CSS modules. */
import { existsSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const isFile = (path) => existsSync(path) && statSync(path).isFile();

registerHooks({
  resolve(specifier, context, nextResolve) {
    const path = specifier.startsWith("@/")
      ? root + specifier.slice(2)
      : specifier.startsWith(".") && context.parentURL
        ? fileURLToPath(new URL(specifier, context.parentURL))
        : null;
    if (path) {
      for (const candidate of [path, `${path}.ts`]) {
        if (isFile(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
