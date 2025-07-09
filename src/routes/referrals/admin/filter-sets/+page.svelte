<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"

    const { data } = $props()

    function onCreate() {
        // not Implemented
    }

    function onEdit(filterSet: (typeof data.filterSets)[number]) {
        // Not implemented
    }

    function onDelete(filterSet: (typeof data.filterSets)[number]) {
        // Not Implemented
    }
</script>

<DataTable data={data.filterSets} idColumn="id" hiddenColumns={["id"]} {onCreate} {onEdit} {onDelete} />
