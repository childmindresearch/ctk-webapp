// Factory for overloads of docx classes that allows for awaitable properties.
import {
    Document,
    Footer,
    Header,
    type ICommentOptions,
    type IHeaderOptions,
    type IImageOptions,
    ImageRun,
    type IParagraphOptions,
    type IPropertiesOptions,
    type IRunOptions,
    type ISectionOptions,
    type ITableCellOptions,
    type ITableOptions,
    type ITableRowOptions,
    Paragraph,
    patchDocument,
    type PatchDocumentOptions,
    Table,
    TableCell,
    TableRow,
    TextRun
} from "docx"

type Awaitable<T> =
    // leave `undefined` alone
    [T] extends [undefined]
        ? T
        : // mutable arrays
          T extends (infer U)[]
          ? Promise<U | NullComponent>[]
          : // readonly arrays
            T extends ReadonlyArray<infer U>
            ? ReadonlyArray<Promise<U | NullComponent>>
            : // plain objects
              T extends Record<string, unknown>
              ? { [K in keyof T]: Awaitable<T[K]> } | Promise<{ [K in keyof T]: Awaitable<T[K]> }>
              : // scalars
                T | Promise<T>

type AwaitableProps<T> = {
    [K in keyof T]: T[K] extends Array<infer U>
        ? Array<Awaitable<U> | Promise<U[]> | Promise<U | null> | null> | Promise<Array<Awaitable<U> | null>>
        : T[K] extends Record<string, unknown>
          ? Awaitable<T[K]>
          : Awaitable<T[K]>
}

type AwaitablePropsWithPredicate<T> = AwaitableProps<T> & {
    predicate?: () => boolean | Promise<boolean>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== "object") {
        return false
    }

    if (Array.isArray(value)) {
        return false
    }

    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype
}

/*
 * Empty component used for filtering components whose predicate evaluates to false.
 */
export class NullComponent {
    constructor() {}
}

/*
 * Utility function to resolve all awaitable properties on an object.
 * Handles promises in arrays and recurses into other objects.
 */
async function resolveProps<T extends Record<string, unknown>>(
    obj: AwaitableProps<T>
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
    const entries = await Promise.all(
        Object.entries(obj).map(async ([k, v]) => {
            const resolvedValue = await v
            if (resolvedValue === undefined) {
                return [k, undefined]
            }

            if (Array.isArray(resolvedValue)) {
                const resolvedArray = await Promise.all(resolvedValue)
                const recursedArray = await Promise.all(
                    resolvedArray.map(val => {
                        if (isPlainObject(val)) {
                            return resolveProps(val)
                        }
                        return val
                    })
                )
                return [k, recursedArray.flat().filter(val => !(val instanceof NullComponent))]
            }
            if (isPlainObject(resolvedValue)) {
                return [k, await resolveProps(resolvedValue as Record<string, unknown>)]
            }
            return [k, resolvedValue]
        })
    )
    return Object.fromEntries(entries)
}

/*
 * The basic builder for an async JS Docx component.
 */
function createBaseBuilder<TOptions extends Record<string, unknown>, TComponent>(
    ComponentClass: new (options: TOptions) => TComponent
) {
    return async (options: AwaitablePropsWithPredicate<TOptions>): Promise<TComponent | NullComponent> => {
        const { predicate, ...optionsWithoutPredicate } = options
        if (predicate && !(await predicate())) return new NullComponent()

        return new ComponentClass(await resolveProps(optionsWithoutPredicate as AwaitableProps<TOptions>))
    }
}

/*
 * createStringBuilder handles components that can receive both object and string input.
 */
function createStringBuilder<TOptions extends Record<string, unknown>, TComponent>(
    ComponentClass: new (options: TOptions | string) => TComponent
) {
    return async (
        options: AwaitablePropsWithPredicate<TOptions> | Awaitable<string>
    ): Promise<TComponent | NullComponent> => {
        const resolved = await options
        if (resolved === null) return new NullComponent()

        if (typeof resolved === "string") {
            return new ComponentClass(resolved)
        }
        return createBaseBuilder(ComponentClass as new (options: TOptions) => TComponent)(resolved)
    }
}

class CommentRegistry {
    private _registry: ICommentOptions[]
    private _idCounter: number

    constructor() {
        this._registry = []
        this._idCounter = 0
    }

    get registry() {
        return this._registry
    }

    get idCounter() {
        return this._idCounter
    }

    public push(children: ICommentOptions["children"], author: string): ICommentOptions {
        const comment = {
            id: this._idCounter,
            author: author,
            date: new Date(),
            children: children
        }
        this._registry.push(comment)
        this._idCounter++
        return comment
    }

    public flush(): ICommentOptions[] {
        const registry = [...this._registry]
        this._registry = []
        return registry
    }
}

export class DocxBuilder {
    readonly commentRegistry: CommentRegistry

    Paragraph = createStringBuilder<IParagraphOptions, Paragraph>(Paragraph)
    TextRun = createStringBuilder<IRunOptions, TextRun>(TextRun)

    Table = createBaseBuilder<ITableOptions, Table>(Table)
    TableRow = createBaseBuilder<ITableRowOptions, TableRow>(TableRow)
    TableCell = createBaseBuilder<ITableCellOptions, TableCell>(TableCell)

    ImageRun = createBaseBuilder<IImageOptions, ImageRun>(ImageRun)

    Header = createBaseBuilder<IHeaderOptions, Header>(Header)
    Footer = createBaseBuilder<IHeaderOptions, Footer>(Footer)

    constructor() {
        this.commentRegistry = new CommentRegistry()
    }

    /*
     * Section does not have a constructor in js docx, so we need to build our own.
     */
    async section(options: AwaitablePropsWithPredicate<ISectionOptions>): Promise<ISectionOptions | NullComponent> {
        const { predicate, ...otherOptions } = options
        if (predicate && !(await predicate())) return new NullComponent()
        return await resolveProps(otherOptions as AwaitableProps<ISectionOptions>)
    }

    /*
     * Document needs a separate constructor so that generated comments can be added after section generation.
     * Adding your own comments is not (yet) supported.
     */
    async document(options: AwaitableProps<Omit<IPropertiesOptions, "comments">>): Promise<Document> {
        const resolved = await resolveProps(options)
        return new Document({
            ...resolved,
            comments: { children: this.commentRegistry.flush() }
        })
    }

    async patchDocument(options: AwaitableProps<PatchDocumentOptions>) {
        const resolved = await resolveProps(options)
        return patchDocument(resolved)
    }
}
