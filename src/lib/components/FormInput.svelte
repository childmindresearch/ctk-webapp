<!--@component
    A form input component with automatic required field indicators.

    @prop label - The label text displayed above the input
    @prop required - Whether the field is required (adds red asterisk)
    @prop placeholder - Placeholder text for the input
    @prop value - The input value (bindable)
    @prop type - HTML input type (text, email, password, etc.)
    @prop labelClass - Additional CSS classes to apply to the label
    @prop spanClass - Additional CSS classes to apply to the span
    @prop inputClass - Additional CSS classes to apply to the input
    @prop disabled - Whether the input is disabled
    @prop maxlength - Maximum length of input
    @prop minlength - Minimum length of input
    @prop pattern - Pattern for input validation
    @prop ...restProps - Additional attributes to pass to the input

    @example
    ```svelte
    <FormInput
        label="Email Address"
        required
        type="email"
        bind:value={email}
        placeholder="Enter your email"
    />
    ```

    @example
    ```svelte
    <FormInput
        label="Optional Notes"
        bind:value={notes}
        placeholder="Additional comments"
        class="bg-gray-100"
    />
    ```
-->
<script lang="ts">
    interface Props {
        label: string
        required?: boolean
        placeholder?: string
        value?: string | null
        type?: string
        labelClass?: string
        spanClass?: string
        inputClass?: string
        disabled?: boolean
        maxlength?: number
        minlength?: number
        pattern?: string
        [key: string]: any
    }

    let {
        label,
        required = false,
        placeholder = "",
        value = $bindable(""),
        type = "text",
        labelClass = "",
        spanClass = "",
        inputClass = "",
        disabled = false,
        maxlength,
        minlength,
        pattern,
        ...restProps
    }: Props = $props()
</script>

<label class="label {labelClass}">
    <span class="text-sm font-semibold text-surface-700-200-token {spanClass}">
        {label}
        {#if required}
            <span class="text-error-500">*</span>
        {/if}
    </span>
    <input
        class="input mt-2 {inputClass}"
        {required}
        {disabled}
        {maxlength}
        {minlength}
        {pattern}
        bind:value
        {placeholder}
        {type}
        {...restProps}
    />
</label>
