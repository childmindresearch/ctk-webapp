<!--@component
    A reusable data table component with sorting, filtering, and pagination capabilities.

    ## Props
    - data: The data to display in the table.
    - idColumn: The column name of the unique identifier.
    - hiddenColumns: Columns to hide in the table.
    - onCreate: Function to execute on clicking the Create button.
    - onEdit: Function to execute on clicking the Edit button.
    - onDelete: Function to execute on clicking the Delete button.

    ## Example
    ```svelte
    <DataTable
        data={myData}
        hiddenColumns={['id']}
        onCreate={() => handleCreate()}
        onEdit={(row) => handleEdit(row)}
        onDelete={(row) => handleDelete(row)}
    />
    ```
-->
<script lang="ts">
    type Props = {
        onEdit?: () => void
        onDelete?: () => void
    }

    import { Pencil, Trash } from "@lucide/svelte"

    let { onEdit, onDelete }: Props = $props()
</script>

<div class="text-center space-x-2">
    {#if onEdit}
        <button
            aria-label="edit"
            class="text-warning-600 hover:text-warning-300 transition-colors duration-150"
            onclick={onEdit}
        >
            <Pencil />
        </button>
    {/if}
    {#if onDelete}
        <button
            aria-label="delete"
            class="text-error-600 hover:text-error-300 transition-colors duration-150"
            onclick={onDelete}
        >
            <Trash />
        </button>
    {/if}
</div>
