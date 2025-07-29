import React from "react";

import {
  Badge,
  Button,
  Label,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  ToolbarFilter,
  type ToolbarLabel,
} from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons";

import type { IFilterControlProps } from "./FilterControl";

export interface FilterSelectOptionProps {
  optionProps?: SelectOptionProps;
  value: string;
  label?: string;
  chipLabel?: string;
  groupLabel?: string;
}

export interface IMultiselectFilterControlProps<TFilterCategoryKey extends string>
  extends IFilterControlProps<TFilterCategoryKey> {
  /** The full set of options to select from for this filter. */
  selectOptions: FilterSelectOptionProps[];
  placeholderText: string;
  isScrollable?: boolean;
}

const NO_RESULTS = "no-results";

export const MultiselectFilterControl = <TFilterCategoryKey extends string>({
  categoryKey,
  categoryName,
  filterValue,
  setFilterValue,
  showToolbarItem,
  isDisabled = false,
  selectOptions,
  placeholderText,
  isScrollable = false,
}: React.PropsWithChildren<IMultiselectFilterControlProps<TFilterCategoryKey>>): JSX.Element | null => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>("");
  const textInputRef = React.useRef<HTMLInputElement>();

  const idPrefix = `filter-control-${categoryKey}`;
  const withPrefix = (id: string) => `${idPrefix}-${id}`;
  const defaultGroup = categoryName;

  const filteredOptions = selectOptions.filter(({ label, value, groupLabel }) =>
    [label ?? value, groupLabel]
      .reduce((prev, current) => {
        if (current) {
          prev.push(current);
        }
        return prev;
      }, [] as string[])
      .map((it) => it.toLocaleLowerCase())
      .some((it) => it.includes(inputValue?.trim().toLowerCase() ?? ""))
  );

  const [firstGroup, ...otherGroups] = [
    ...new Set([
      ...(selectOptions
        ?.map(({ groupLabel }) => groupLabel)
        .reduce((prev, current) => {
          if (current) {
            prev.push(current);
          }
          return prev;
        }, [] as string[]) ?? []),
      defaultGroup,
    ]),
  ];

  const onFilterClearGroup = (groupName: string) =>
    setFilterValue(
      filterValue
        ?.map((filter): [string, FilterSelectOptionProps | undefined] => [
          filter,
          selectOptions?.find(({ value }) => filter === value),
        ])
        .filter(([, option]) => option)
        .map(([filter, { groupLabel = defaultGroup } = {}]) => [filter, groupLabel])
        .filter(([, groupLabel]) => groupLabel !== groupName)
        .map(([filter]) => filter)
    );
  const onFilterClear = (chip: string | ToolbarLabel) => {
    const value = typeof chip === "string" ? chip : chip.key;

    if (value) {
      const newValue = filterValue?.filter((val) => val !== value) ?? [];
      setFilterValue(newValue.length > 0 ? newValue : null);
    }
  };

  /*
   * Note: Create chips only as `ToolbarChip` (no plain string)
   */
  const chipsFor = (groupName: string) =>
    filterValue
      ?.map((filter) =>
        selectOptions.find(({ value, groupLabel = defaultGroup }) => value === filter && groupLabel === groupName)
      )
      .reduce((prev, current) => {
        if (current) {
          prev.push(current);
        }
        return prev;
      }, [] as FilterSelectOptionProps[])
      .map((option) => {
        const { chipLabel, label, value } = option;
        const displayValue: string = chipLabel ?? label ?? value ?? "";

        return {
          key: value,
          node: displayValue,
        };
      });

  const onSelect = (value: string | undefined) => {
    if (!value || value === NO_RESULTS) {
      return;
    }

    const newFilterValue: string[] = filterValue?.includes(value)
      ? filterValue.filter((item) => item !== value)
      : [...(filterValue ?? []), value];

    setFilterValue(newFilterValue);
  };

  const { focusedItemIndex, getFocusedItem, clearFocusedItemIndex, moveFocusedItemIndex } = useFocusHandlers({
    filteredOptions,
  });

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        if (!isFilterDropdownOpen) {
          setIsFilterDropdownOpen(true);
        } else if (getFocusedItem()?.value) {
          onSelect(getFocusedItem()?.value);
        }
        textInputRef?.current?.focus();
        break;
      case "Tab":
      case "Escape":
        setIsFilterDropdownOpen(false);
        clearFocusedItemIndex();
        break;
      case "ArrowUp":
      case "ArrowDown":
        event.preventDefault();
        if (isFilterDropdownOpen) {
          moveFocusedItemIndex(event.key);
        } else {
          setIsFilterDropdownOpen(true);
        }
        break;
      default:
        break;
    }
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    if (!isFilterDropdownOpen) {
      setIsFilterDropdownOpen(true);
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={() => {
        setIsFilterDropdownOpen(!isFilterDropdownOpen);
      }}
      isExpanded={isFilterDropdownOpen}
      isDisabled={isDisabled || !selectOptions.length}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={() => {
            setIsFilterDropdownOpen(!isFilterDropdownOpen);
          }}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id={withPrefix("typeahead-select-input")}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholderText}
          aria-activedescendant={getFocusedItem() ? withPrefix(`option-${focusedItemIndex}`) : undefined}
          role="combobox"
          isExpanded={isFilterDropdownOpen}
          aria-controls={withPrefix("select-typeahead-listbox")}
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                setInputValue("");
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
          {filterValue?.length ? <Badge isRead>{filterValue.length}</Badge> : null}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  const withGroupPrefix = (group: string) => (group === categoryName ? group : `${categoryName}/${group}`);

  return (
    <>
      {
        <ToolbarFilter
          id={`${idPrefix}-${firstGroup}`}
          labels={chipsFor(firstGroup)}
          deleteLabel={(_, chip) => onFilterClear(chip)}
          deleteLabelGroup={() => onFilterClearGroup(firstGroup)}
          categoryName={{ name: firstGroup, key: withGroupPrefix(firstGroup) }}
          key={withGroupPrefix(firstGroup)}
          showToolbarItem={showToolbarItem}
        >
          <Select
            isScrollable={isScrollable}
            aria-label={categoryName}
            toggle={toggle}
            selected={filterValue}
            onOpenChange={(isOpen) => setIsFilterDropdownOpen(isOpen)}
            onSelect={(_, selection) => onSelect(selection as string)}
            isOpen={isFilterDropdownOpen}
          >
            <SelectList id={withPrefix("select-typeahead-listbox")}>
              {filteredOptions.map(({ groupLabel, label, value, optionProps = {} }, index) => (
                <SelectOption
                  {...optionProps}
                  {...(!optionProps.isDisabled && { hasCheckbox: true })}
                  key={value}
                  id={withPrefix(`option-${index}`)}
                  value={value}
                  isFocused={focusedItemIndex === index}
                  isSelected={filterValue?.includes(value)}
                >
                  {!!groupLabel && <Label>{groupLabel}</Label>} {label ?? value}
                </SelectOption>
              ))}
              {filteredOptions.length === 0 && (
                <SelectOption isDisabled hasCheckbox={false} key={NO_RESULTS} value={NO_RESULTS} isSelected={false}>
                  {`No results found for "${inputValue}"`}
                </SelectOption>
              )}
            </SelectList>
          </Select>
        </ToolbarFilter>
      }
      {otherGroups.map((groupName) => (
        <ToolbarFilter
          id={`${idPrefix}-${groupName}`}
          labels={chipsFor(groupName)}
          deleteLabel={(_, chip) => onFilterClear(chip)}
          deleteLabelGroup={() => onFilterClearGroup(groupName)}
          categoryName={{ name: groupName, key: withGroupPrefix(groupName) }}
          key={withGroupPrefix(groupName)}
          showToolbarItem={false}
        >
          {" "}
        </ToolbarFilter>
      ))}
    </>
  );
};

const useFocusHandlers = ({ filteredOptions }: { filteredOptions: FilterSelectOptionProps[] }) => {
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number>(0);

  const moveFocusedItemIndex = (key: string) => setFocusedItemIndex(calculateFocusedItemIndex(key));

  const calculateFocusedItemIndex = (key: string): number => {
    if (!filteredOptions.length) {
      return 0;
    }

    if (key === "ArrowUp") {
      return focusedItemIndex <= 0 ? filteredOptions.length - 1 : focusedItemIndex - 1;
    }

    if (key === "ArrowDown") {
      return focusedItemIndex >= filteredOptions.length - 1 ? 0 : focusedItemIndex + 1;
    }
    return 0;
  };

  const getFocusedItem = () =>
    filteredOptions[focusedItemIndex] && !filteredOptions[focusedItemIndex]?.optionProps?.isDisabled
      ? filteredOptions[focusedItemIndex]
      : undefined;

  return {
    moveFocusedItemIndex,
    focusedItemIndex,
    getFocusedItem,
    clearFocusedItemIndex: () => setFocusedItemIndex(0),
  };
};
