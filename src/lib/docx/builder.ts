// Factory for overloads of docx classes that allows for awaitable properties.
import {
    AlignmentType,
    Document,
    Footer,
    Header,
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
    LevelFormat,
    Paragraph,
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
          ? Awaitable<U | NullComponent>[] | Promise<Awaitable<U | NullComponent>[]>
          : // readonly arrays
            T extends ReadonlyArray<infer U>
            ? ReadonlyArray<Awaitable<U | NullComponent>> | Promise<ReadonlyArray<Awaitable<U | NullComponent>>>
            : // plain objects
              T extends Record<string, unknown>
              ? { [K in keyof T]: Awaitable<T[K]> } | Promise<{ [K in keyof T]: Awaitable<T[K]> }>
              : // scalars
                T | Promise<T>

export type AwaitableProps<T> = {
    [K in keyof T]: T[K] extends Array<infer U>
        ? Array<Awaitable<U> | Promise<U[]> | Promise<U | null> | null> | Promise<Array<Awaitable<U> | null>>
        : T[K] extends Record<string, unknown>
          ? Awaitable<T[K]>
          : Awaitable<T[K]>
}

type AwaitablePropsWithOptionalPredicate<T> = AwaitableProps<T> & {
    predicate?: () => boolean | Promise<boolean>
}

type AwaitablePropsWithRequiredPredicate<T> = AwaitableProps<T> & {
    predicate: () => boolean | Promise<boolean>
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
export async function resolveProps<T extends Record<string, unknown>>(
    obj: AwaitableProps<T>
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
    const entries = await Promise.all(
        Object.entries(await obj).map(async ([k, v]) => {
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
    async function builder(options: AwaitablePropsWithRequiredPredicate<TOptions>): Promise<TComponent | NullComponent>
    async function builder(options: AwaitableProps<TOptions>): Promise<TComponent>
    async function builder(
        options: AwaitablePropsWithOptionalPredicate<TOptions>
    ): Promise<TComponent | NullComponent> {
        const { predicate, ...optionsWithoutPredicate } = options
        if (predicate && !(await predicate())) return new NullComponent()
        return new ComponentClass(await resolveProps(optionsWithoutPredicate as AwaitableProps<TOptions>))
    }
    return builder
}

/*
 * createStringBuilder handles components that can receive both object and string input.
 */
function createStringBuilder<TOptions extends Record<string, unknown>, TComponent>(
    ComponentClass: new (options: TOptions | string) => TComponent
) {
    async function builder(options: AwaitablePropsWithRequiredPredicate<TOptions>): Promise<TComponent | NullComponent>
    async function builder(options: AwaitableProps<TOptions> | Awaitable<string>): Promise<TComponent>
    async function builder(
        options: AwaitablePropsWithOptionalPredicate<TOptions> | Awaitable<string>
    ): Promise<TComponent | NullComponent> {
        const resolved = await options
        if (resolved === null) return new NullComponent()
        if (typeof resolved === "string") {
            return new ComponentClass(resolved)
        }
        return createBaseBuilder(ComponentClass as new (options: TOptions) => TComponent)(resolved)
    }
    return builder
}

export class DocxBuilderClient {
    Paragraph = createStringBuilder<IParagraphOptions, Paragraph>(Paragraph)
    TextRun = createStringBuilder<IRunOptions, TextRun>(TextRun)

    Table = createBaseBuilder<ITableOptions, Table>(Table)
    TableRow = createBaseBuilder<ITableRowOptions, TableRow>(TableRow)
    TableCell = createBaseBuilder<ITableCellOptions, TableCell>(TableCell)

    ImageRun = createBaseBuilder<IImageOptions, ImageRun>(ImageRun)

    Header = createBaseBuilder<IHeaderOptions, Header>(Header)
    Footer = createBaseBuilder<IHeaderOptions, Footer>(Footer)

    /*
     * Section does not have a constructor in js docx, so we need to build our own.
     */
    async section(
        options: AwaitablePropsWithRequiredPredicate<ISectionOptions>
    ): Promise<ISectionOptions | NullComponent>
    async section(options: AwaitableProps<ISectionOptions>): Promise<ISectionOptions>
    async section(
        options: AwaitablePropsWithOptionalPredicate<ISectionOptions>
    ): Promise<ISectionOptions | NullComponent> {
        const { predicate, ...otherOptions } = options
        if (predicate && !(await predicate())) return new NullComponent()
        return await resolveProps(otherOptions as AwaitableProps<ISectionOptions>)
    }

    /*
     * Document needs a separate constructor so that generated comments can be added after section generation.
     * Adding your own comments is not (yet) supported.
     * Adds some sensible defaults that can be overridden with the options.
     */
    async document(options: AwaitableProps<Omit<IPropertiesOptions, "comments">>): Promise<Document> {
        const resolved = await resolveProps(options)
        return new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: "Normal",
                        name: "Normal",
                        next: "Normal",
                        run: {
                            font: "Cambria",
                            size: 24 // Font size in Word seems to be size/2.
                        }
                    }
                ]
            },
            numbering: {
                config: [
                    {
                        reference: "default",
                        levels: [
                            {
                                level: 0,
                                format: LevelFormat.UPPER_ROMAN,
                                text: "%1",
                                alignment: AlignmentType.START,
                                style: {
                                    paragraph: {
                                        indent: { left: 2880, hanging: 2420 }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            ...resolved
        })
    }
}
