"use client"

import {Toaster} from "react-hot-toast";

const ToastProvider = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
        />
    )
}

export default ToastProvider;