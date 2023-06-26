import React, { ReactElement } from 'react';
import { Button } from '@fluentui/react-components';
import { DrawerOverlay, DrawerHeader, DrawerHeaderTitle, DrawerBody } from '@fluentui/react-components/unstable';
import { Dismiss24Regular } from "@fluentui/react-icons";

export function Drawer({ header, isOpen = false, children, onStateChange }: { header: string, isOpen?: boolean, children: ReactElement, onStateChange?: (state: boolean) => void }) {
  return (
    <DrawerOverlay
      open={isOpen}
      onOpenChange={(_, { open }) => onStateChange?.(open)}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={() => onStateChange?.(false)} />
          }>
          {header}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        {children}
      </DrawerBody>
    </DrawerOverlay>
  );
}
