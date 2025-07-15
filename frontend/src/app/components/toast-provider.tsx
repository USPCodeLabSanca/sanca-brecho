"use client"

import {Toaster} from "react-hot-toast";

const ToastProvider = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={true}
        />
    )
}

export default ToastProvider;