import React, { useCallback, useMemo, useState } from "react";
import { jt, t } from "ttag";
import { getEngineLogo } from "metabase/lib/engine";
import Settings from "metabase/lib/settings";
import TextInput from "metabase/components/TextInput";
import ExternalLink from "metabase/core/components/ExternalLink";
import {
  EngineButtonIcon,
  EngineButtonRoot,
  EngineButtonTitle,
  EngineCardIcon,
  EngineCardImage,
  EngineCardRoot,
  EngineCardTitle,
  EngineEmptyIcon,
  EngineEmptyStateRoot,
  EngineEmptyText,
  EngineExpandButton,
  EngineListRoot,
  EngineSearchRoot,
} from "./EngineWidget.styled";
import { EngineField, EngineOption } from "./types";

export interface EngineWidget {
  field: EngineField;
  options: EngineOption[];
  isHosted: boolean;
}

const EngineWidget = ({
  field,
  options,
  isHosted,
}: EngineWidget): JSX.Element => {
  if (field.value) {
    return <EngineButton field={field} options={options} />;
  } else {
    return <EngineSearch field={field} options={options} isHosted={isHosted} />;
  }
};

interface EngineButtonProps {
  field: EngineField;
  options: EngineOption[];
}

const EngineButton = ({ field, options }: EngineButtonProps): JSX.Element => {
  const option = options.find(option => option.value === field.value);

  const handleClick = useCallback(() => {
    field.onChange?.(undefined);
  }, [field]);

  return (
    <EngineButtonRoot>
      <EngineButtonTitle>
        {option ? option.name : field.value}
      </EngineButtonTitle>
      <EngineButtonIcon
        name="close"
        size={18}
        aria-label={t`Remove database`}
        onClick={handleClick}
      />
    </EngineButtonRoot>
  );
};

interface EngineSearchProps {
  field: EngineField;
  options: EngineOption[];
  isHosted: boolean;
}

const EngineSearch = ({
  field,
  options,
  isHosted,
}: EngineSearchProps): JSX.Element => {
  const [searchText, setSearchText] = useState("");
  const isSearching = searchText.length > 0;

  const sortedOptions = useMemo(() => {
    return getSortedOptions(options);
  }, [options]);

  const visibleOptions = useMemo(
    () => getVisibleOptions(sortedOptions, isSearching, searchText),
    [sortedOptions, isSearching, searchText],
  );

  return (
    <EngineSearchRoot>
      <TextInput
        value={searchText}
        placeholder={t`Search for a database…`}
        onChange={setSearchText}
      />
      {visibleOptions.length ? (
        <EngineList field={field} options={visibleOptions} />
      ) : (
        <EngineEmptyState isHosted={isHosted} />
      )}
    </EngineSearchRoot>
  );
};

interface EngineListProps {
  field: EngineField;
  options: EngineOption[];
}

const EngineList = ({ field, options }: EngineListProps): JSX.Element => {
  return (
    <EngineListRoot>
      {options.map(option => (
        <EngineCard key={option.value} field={field} option={option} />
      ))}
    </EngineListRoot>
  );
};

export interface EngineCardProps {
  field: EngineField;
  option: EngineOption;
}

const EngineCard = ({ field, option }: EngineCardProps): JSX.Element => {
  const logo = getEngineLogo(option.value);

  const handleClick = useCallback(() => {
    field.onChange?.(option.value);
  }, [field, option]);

  return (
    <EngineCardRoot key={option.value} onClick={handleClick}>
      {logo ? (
        <EngineCardImage src={logo} />
      ) : (
        <EngineCardIcon name="database" />
      )}
      <EngineCardTitle>{option.name}</EngineCardTitle>
    </EngineCardRoot>
  );
};

interface EngineEmptyStateProps {
  isHosted: boolean;
}

const EngineEmptyState = ({ isHosted }: EngineEmptyStateProps): JSX.Element => {
  return (
    <EngineEmptyStateRoot>
      <EngineEmptyIcon name="search" size={32} />
      {isHosted ? (
        <EngineEmptyText>{t`Didn’t find anything`}</EngineEmptyText>
      ) : (
        <EngineEmptyText>{jt`Don’t see your database? Check out our ${(
          <ExternalLink href={Settings.docsUrl("developers-guide-drivers")}>
            {t`Community Drivers`}
          </ExternalLink>
        )} page to see if it’s available for self-hosting.`}</EngineEmptyText>
      )}
    </EngineEmptyStateRoot>
  );
};

interface EngineToggleProps {
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
}

const EngineToggle = ({
  isExpanded,
  onExpandedChange,
}: EngineToggleProps): JSX.Element => {
  const handleClick = useCallback(() => {
    onExpandedChange(!isExpanded);
  }, [isExpanded, onExpandedChange]);

  return (
    <EngineExpandButton
      primary
      iconRight={isExpanded ? "chevronup" : "chevrondown"}
      onClick={handleClick}
    >
      {isExpanded ? t`Show less options` : t`Show more options`}
    </EngineExpandButton>
  );
};

const getSortedOptions = (options: EngineOption[]): EngineOption[] => {
  return options.sort((a, b) => {
    if (a.index >= 0 && b.index >= 0) {
      return a.index - b.index;
    } else if (a.index >= 0) {
      return -1;
    } else if (b.index >= 0) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
};

const getVisibleOptions = (
  options: EngineOption[],
  isSearching: boolean,
  searchText: string,
): EngineOption[] => {
  if (isSearching) {
    return options.filter(e => includesIgnoreCase(e.name, searchText));
  } else {
    return options;
  }
};

const includesIgnoreCase = (
  sourceText: string,
  searchText: string,
): boolean => {
  return sourceText.toLowerCase().includes(searchText.toLowerCase());
};

export default EngineWidget;
