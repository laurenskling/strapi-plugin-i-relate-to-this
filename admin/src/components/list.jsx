import React, { useEffect, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Tooltip } from '@strapi/design-system';
import {
  getFetchClient,
  useNotification,
} from '@strapi/strapi/admin';
import { Link } from 'react-router-dom';

const useThisCode = true;

const ConditionalTooltip = ({ isShown, label, children }) => {
  if (isShown) {
    return <Tooltip label={label}>{children}</Tooltip>;
  }

  return children;
};

const List = ({
  model,
  activeTab, // draft / published
  document,
}) => {
  const { documentId, id } = document || {}; // support singleTypes
  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();
  const [items, setItems] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const getter = useCallback(async () => {
    const { get } = getFetchClient();
    let response;
    const endpoint = `/i-relate-to-this/${model}/${id}/${documentId}/${activeTab}`;
    try {
      response = await get(endpoint);
    } catch (error) {
      return toggleNotification({
        type: 'warning',
        message: formatMessage({
          id: 'Failed to load list',
          defaultMessage: error,
        }),
      });
    }
    setItems(response.data.items);
    setLoaded(true);
    return null;
  }, [
    model,
    id,
    documentId,
    activeTab,
    toggleNotification,
    formatMessage,
    setItems,
  ]);

  useEffect(() => {
    // single types don't have an documentId
    // on create there are never relations
    setItems(null);
    if (useThisCode && documentId) {
      getter();
    }
  }, [documentId, getter, setItems]);

  if (!useThisCode) {
    return null;
  }

  if (!loaded) {
    return null;
  }

  if (!items || Object.keys(items).length === 0) {
    return 'No relations found';
  }

  return Object.entries(items).map(([contentTypeTitle, entries]) => (
    <div key={contentTypeTitle}>
      <h2 style={{ paddingBottom: '0.5rem' }}>{contentTypeTitle}</h2>
      {entries.map(({
        documentId,
        title,
        uid,
        isPublished,
      }) => (
        <div key={documentId} style={{ paddingBottom: '0.5rem' }}>
          <ConditionalTooltip isShown={!isPublished} label={`Current entry is not linked to the published version of ${title}, please publish ${title} to publish the relation`}>
            <Button
              variant={!isPublished ? 'danger' : 'tertiary'}
              tag={Link}
              to={{ pathname: `/content-manager/collection-types/${uid}/${documentId}` }}
            >
              {!isPublished && '⚠'} {title || documentId}
            </Button>
          </ConditionalTooltip>
        </div>
      ))}
    </div>
  ));
};

export default List;
