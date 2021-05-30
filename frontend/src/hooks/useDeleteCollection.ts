import {useEffect, useState} from "react";

const useDeleteCollection = () => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [rowsToDelete, setRowsToDelete] = useState<{data: Array<{ index: number; dataIndex: number }>}>({data: []});

    useEffect(() => {
        if (rowsToDelete.data.length) {
            setOpenDeleteDialog(true);
        }
    }, [rowsToDelete]);

    return {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete};
}

export default useDeleteCollection;
