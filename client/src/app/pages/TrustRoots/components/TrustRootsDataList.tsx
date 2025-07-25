import { Fragment, useRef, useState, type LegacyRef } from "react";

import {
  Content,
  DataList,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
} from "@patternfly/react-core";

import { exampleTrustRoots } from "../data/TrustRoots.data";
import TrustRootRow, { type LastStatus, type TrustRootRowProps } from "./TrustRootRow";
import { TrustRootsDrawerContent } from "./TrustRootsDrawerContent";

const TrustRootsDataList = () => {
  const [selectedRow, setSelectedRow] = useState("");
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(undefined);

  const getStatus = (id: string): LastStatus => {
    const dummyStatuses: { id: string; lastStatus: LastStatus }[] = [
      { id: exampleTrustRoots[0].id, lastStatus: null },
      { id: exampleTrustRoots[1].id, lastStatus: null },
      { id: exampleTrustRoots[2].id, lastStatus: "success" },
      { id: exampleTrustRoots[3].id, lastStatus: "error" },
      { id: exampleTrustRoots[4].id, lastStatus: null },
    ];
    // to be updated
    return dummyStatuses.find((status) => status.id === id)?.lastStatus ?? null;
  };

  const getIsRunning = (id: string): boolean => {
    const dummyRuns = [
      { id: exampleTrustRoots[0].id, running: false },
      { id: exampleTrustRoots[1].id, running: true },
      { id: exampleTrustRoots[2].id, running: false },
      { id: exampleTrustRoots[3].id, running: true },
      { id: exampleTrustRoots[4].id, running: false },
    ];
    return dummyRuns.find((run) => run.id === id)?.running ?? false;
  };

  const rowData: TrustRootRowProps[] = exampleTrustRoots.map((trustRoot) => {
    return {
      id: trustRoot.id,
      lastStatus: getStatus(trustRoot.id),
      isRunning: getIsRunning(trustRoot.id),
      trustRoot,
    };
  });

  // const rowData: TrustRootRowProps[] = [
  //   { id: 'row-1', lastStatus: null, isRunning: false },
  //   { id: 'row-2', lastStatus: null, isRunning: true },
  //   { id: 'row-3', lastStatus: 'success', isRunning: false },
  //   { id: 'row-4', lastStatus: 'error', isRunning: false },
  //   { id: 'row-5', lastStatus: null, isRunning: false },
  // ];

  return (
    <Fragment>
      <Drawer isExpanded={isDrawerExpanded} onExpand={() => {}} position="end">
        <DrawerContent
          panelContent={
            <DrawerPanelContent
              isResizable
              onResize={() => {}}
              id="end-resize-panel"
              defaultSize={"750px"}
              minSize={"150px"}
            >
              <DrawerHead>
                <div tabIndex={isDrawerExpanded ? 0 : -1} ref={drawerRef as LegacyRef<HTMLDivElement>}>
                  <Content component="h3">
                    {exampleTrustRoots.find((tr) => tr.id === selectedRow)?.name ?? selectedRow}
                  </Content>
                </div>
                <DrawerActions>
                  <DrawerCloseButton
                    onClick={() => {
                      setIsDrawerExpanded(false);
                      setSelectedRow("");
                    }}
                  />
                </DrawerActions>
              </DrawerHead>
              <TrustRootsDrawerContent trustRootId={selectedRow} />
            </DrawerPanelContent>
          }
        >
          <DrawerContentBody>
            <DataList
              aria-label="Demo trust data list"
              selectedDataListItemId={selectedRow}
              onSelectDataListItem={(_e, id) => {
                setSelectedRow(id);
                setIsDrawerExpanded(true);
              }}
              onSelectableRowChange={(_e, id) => {
                setSelectedRow(id);
                setIsDrawerExpanded(true);
              }}
            >
              {rowData.map((row) => (
                <TrustRootRow key={row.id} {...row} />
              ))}
            </DataList>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
};

export { TrustRootsDataList };
