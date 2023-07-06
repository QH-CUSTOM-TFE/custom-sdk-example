import React, { ComponentClass, FunctionComponent } from 'react';

import styles from './index.module.scss';

export interface IAppLayoutProps {
    header?: FunctionComponent<any> | ComponentClass<any> | string;
    rightPanel?: FunctionComponent<any> | ComponentClass<any> | string;
    footer?: FunctionComponent<any> | ComponentClass<any> | string;
}

export function AppLayout(props: IAppLayoutProps) {
    const { header: Header, footer: Footer, rightPanel: RightPanel } = props;

    const header = Header && (
        <header className={styles.appHeader}>
            <Header />
        </header>
    );
    const rightPanel = RightPanel && (
        <div className={styles.appRightPanel}>
            <RightPanel />
        </div>
    );
    const footer = Footer && (
        <footer className={styles.appFooter}>
            <Footer />
        </footer>
    );

    return (
        <div className={styles.app}>
            {header}
            {footer}
            {rightPanel}
        </div>
    );
}
