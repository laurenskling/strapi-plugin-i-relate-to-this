import React, { useEffect, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import { Link } from '@strapi/design-system';
import {
  getFetchClient,
  useNotification,
} from '@strapi/strapi/admin';

const useThisCode = true;

const List = () => {
  const { formatMessage } = useIntl();
  const { id, slug } = useParams();
  const [params] = useSearchParams();
  const { toggleNotification } = useNotification();
  const [items, setItems] = useState([]);
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

  return items.length > 0 && (
    <div>
      Links:
      {items.map(({
        documentId,
        title,
        uid,
        contentTypeDisplayName,
        isPublished,
      }) => (
        <div key={documentId}>
          <Link
            href={`/admin/content-manager/collection-types/${uid}/${documentId}`}
          >
            {!isPublished && '⚠'} {contentTypeDisplayName}: {title || documentId}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default List;
