import React, { useEffect, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
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

const List = () => {
  const { formatMessage } = useIntl();
  const { id, slug } = useParams();
  const [params] = useSearchParams();
  const { toggleNotification } = useNotification();
  const [items, setItems] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const status = params.get('status') || 'draft';

  const getter = useCallback(async () => {
    const { get } = getFetchClient();
    let response;
    const endpoint = `/i-relate-to-this/list/${slug}/${id}/${status}`;
    try {
      response = await get(endpoint, { id });
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
  }, [formatMessage, id, toggleNotification, slug, status, setItems]);

  useEffect(() => {
    // single types don't have an id
    // on create there are never relations
    if (useThisCode && id && id !== 'create') {
      getter();
    }
  }, [id, getter]);

  if (!useThisCode) {
    return null;
  }

  if (!loaded) {
    return null;
  }

  if (!items) {
    return null;
  }

  return Object.entries(items).map(([contentTypeTitle, entries]) => (
    <div>
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
