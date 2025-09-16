
import snakeCase from 'lodash.snakecase';
import mergeWith from 'lodash.mergewith';

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    // we hard assume only one item is added to the array
    return objValue.includes(srcValue[0]) ? objValue : objValue.concat(srcValue[0]);
  }
  return undefined;
}

const search = async (id, status, parent) => {
  const modelsWithRelationsToMe = Object
    .values({ ...strapi.contentTypes, ...strapi.components })
    .reduce((total, model) => {
      const {
        attributes,
      } = model;
      const relations = Object.entries(attributes).reduce((acc, [key, {
        type,
        target,
        inversedBy,
        mappedBy,
        component,
        components,
      }]) => {
        // localizations is always a relation to self
        if (key === 'localizations') {
          return acc;
        }
        if (
          // only uni relations
          !(type === 'relation' && target === parent.uid && !inversedBy && !mappedBy)
          && !(type === 'component' && component === parent.uid)
          && !(type === 'dynamiczone' && components?.includes(parent.uid))
        ) {
          return acc;
        }
        return acc.concat({
          key,
          type,
          ...model,
        });
      }, []);
      return total.concat(relations);
    }, []);

  const lookups = modelsWithRelationsToMe.reduce(async (acc, {
    key,
    type,
    ...model
  }) => {
    const {
      collectionName,
      modelName,
    } = model;
    const relationIdColumn = type === 'relation' ? strapi.db.metadata.identifiers.getJoinColumnAttributeIdName(
      snakeCase(modelName),
    ) : 'entity_id';
    const parentIdColumn = type === 'relation' ? strapi.db.metadata.identifiers.getJoinColumnAttributeIdName(
      snakeCase(parent.modelName),
    ) : 'cmp_id';
    const tableName = type === 'relation'
      ? `${snakeCase(`${collectionName} ${key} lnk`)}`
      : `${collectionName}_cmps`; // not snaked cased!

    // find this item in the db
    // console.log(`getting ${relationIdColumn} for ${parentIdColumn} ${id} from ${tableName}`);
    const relationsInTable = await strapi.db.getConnection(tableName).where({
      [parentIdColumn]: id,
      ...(type === 'relation' ? {} : {
        component_type: parent.uid,
      }),
    });

    // not related in this db, skip
    if (relationsInTable.length === 0) {
      return acc;
    }

    const itemsForThisCollection = relationsInTable.reduce(async (deepacc, item) => {
      const prev = await deepacc;
      // we've reached our endpoint if:
      if (model.uid.startsWith('api::') || model.uid.startsWith('plugin::')) {
        // make sure we dont have duplicates
        return mergeWith(prev, {
          [model.uid]: {
            info: model.info,
            items: [item[relationIdColumn]],
          },
        }, customizer);
      }
      // still a component, keep searching deeper
      const next = await search(item[relationIdColumn], status, model);
      return mergeWith(prev, next, customizer);
    }, {});

    // acc is the list of models, add the current found model ids
    return mergeWith(await acc, await itemsForThisCollection, customizer);
  }, {});

  return lookups;
};

const service = ({ strapi }) => ({
  async getunirelations(contentType, documentId, status = 'draft') {
    const ct = strapi.contentType(contentType);

    // find the db id by documentId
    const entity = await strapi.documents(contentType).findOne({
      documentId,
      fields: ['id'],
      status,
    });
    // go fetch all related items to me
    const relatedEntries = await search(entity.id, status, ct);

    let publishedDocumentIds = [];
    if (status === 'draft') {
      // find the db id by documentId
      const entityPub = await strapi.documents(contentType).findOne({
        documentId,
        fields: ['id'],
        status: 'published',
      });

      // current document could be draft and have no published version
      if (entityPub) {
        // go fetch all related items to me in published
        const relatedEntriesPub = await search(entityPub.id, status, ct);
        publishedDocumentIds = (await Object.entries(relatedEntriesPub).reduce(async (acc, [
          uid,
          { items },
        ]) => {
          const prev = await acc;
          const entries = (await strapi.documents(uid).findMany({
            filters: { id: { $in: items } },
            status: 'published',
            fields: ['documentId'],
          }));
          // add all entries for all models together
          return prev.concat(entries);
        }, [])).map(({ documentId: dId }) => dId);
      }
    }

    // convert results into a list of elements for the UI
    const result = await Object.entries(relatedEntries).reduce(async (acc, [
      uid,
      { items, info },
    ]) => {
      const prev = await acc;
      // // find all entries for this model
      const entries = (await strapi.documents(uid).findMany({
        filters: { id: { $in: items } },
        status,
      }))
        // create an output for the UI
        .map((entry) => ({
          uid,
          title: entry.title || entry.name,
          documentId: entry.documentId,
          isPublished: status === 'published' || publishedDocumentIds.includes(entry.documentId),
        }));
      // add all entries for all models together
      return {
        ...prev,
        [info.displayName]: entries,
      };
    }, {});

    return result;
  },
});

export default service;
