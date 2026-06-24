import React from "react";
import { ValuesProps } from "./ValuesProps";

export type Props = {
    onFinished: (values?: ValuesProps) => void;
    onPrevious?: () => void;
    prevIcon?: React.ReactNode;
    nextIcon?: React.ReactNode;
};
