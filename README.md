# strapi-plugin-i-relate-to-this

List unidirectional relations (in components) to the current content entity.

## What does this do

Uni-directional relations are only visible on one side of the relation. This plugin will create a list of content entities that have a uni relation to the current entity.

## Why

Strapi 5 allows you to relate (from source) to draft content (the target). When you publish that (target) related entity, it is not directly synced to the published version of the (source) entity that relates to it. It (the target) will remain unpublished until you publish the (source) entity.

Imagine having hunderds of relations to some campaign which ends, you unpublish it, and next month you publish it again. Good luck finding all uni-relations inside of components to it. This plugin will help you!

This plugin lists all entities that have uni-relations (deeply nested in DZs/components) to the current entity you are editing. It will warn you (⚠) when the (source) entity is published but the related (target) entity does not contain the relation in their published version.

## Help wanted

Currently, I have been focussing on getting the data from the db. The UI isn't pretty. Feel free to make a PR to make it pretty, or to improve the lookup logic. Thanks <3

## TODO

- Create a pretty UI
- Maybe I should not auto-load the list, but have a button that requests it. (there's a lot of db queries happening to get this data)

## Related issues

https://github.com/strapi/strapi/issues/23460