<!--
    FormInput.svelte

    A form input component with automatic required field indicators.

    @component
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
    /**
     * Props interface for the FormInput component
     */
    interface Props {
        /** The label text displayed above the input */
        label: string
        /** Whether the field is required (adds red asterisk) */
        required?: boolean
        /** Placeholder text for the input */
        placeholder?: string
        /** The input value (bindable) */
        value?: string | null
        /** HTML input type (text, email, password, etc.) */
        type?: string
        /** Additional CSS classes to apply to the label */
        labelClass?: string
        /** Additonal CSS classes to apply to the span */
        spanClass?: string
        /** Additional CSS classes to apply to the input */
        inputClass?: string
        /** Whether the input is disabled */
        disabled?: boolean
        /** Maximum length of input */
        maxlength?: number
        /** Minimum length of input */
        minlength?: number
        /** Pattern for input validation */
        pattern?: string
        /** Additional attributes to pass to the input */
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
