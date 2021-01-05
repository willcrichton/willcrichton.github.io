---
layout: post
title: Type Systems and Ontology
abstract: >-
    TODO
---

Programs are often used to represent information about the world. For example, classes are used to represent related information and actions on that information.

```python
@dataclass
class User:
  first_name: str
  last_name: str

  def full_name(self):
    return self.first_name + self.last_name

will = User(first_name='Will', last_name='Crichton')
assert will.full_name() == 'Will Crichton'
```

By virtue of this class containing two fields, we understand that within an instance of this class, the two fields are somehow related. In this case, these fields are supposed to be the first and last name of the same user, as opposed to two names from unrelated people.

More generally, the features offered by programming languages (like class systems) encourage specific kinds of *ontology*, or systematic representations of knowledge. Today, most general-purpose programming languages support *hierarchical* knowledge. For example, a group contains a list of users:

```python
@dataclass
class Group:
  users: List[User]

pl_enthusiasts = Group(users=[will])
assert len(pl_enthusiasts.users) == 1
```

Hierarchical ontologies make some knowledge operations easy, generally those that are top-down: they start at the root and go down. For example, if I have a list of groups, I can find the group with the most members.

```python
all_groups = [pl_enthuasiasts, ...]
group_counts = all_groups.map(lambda group: len(group.users))
max_group = all_groups[argmax(group_counts)]
```

But what if I want to find the user with the longest last name?

```python
name_lens = enumerate(all_groups) \
  .map(lambda (i, group): \
    enumerate(group.users) \
      .map(lambda (j, user): (i, j, len(user.last_name))))

(i, j, _) = argmax(name_lens, key=itemgetter(2))
user = all_groups[i].users[j]
```

Yikes, that's a lot of code for a simple query. The core problem is that our question had nothing to do with groups, but our hierarchical representation of knowledge starts with groups at the top-level, so we have to query through them to get at the users.

How can we solve this problem? One possibility is to keep a list of users separate from the groups.

```python
all_users = [user for group in all_groups for user in group.users]
name_lens = all_user.map(lambda user: len(user.last_name))
user = all_users[argmax(name_lens)]
```

This starts to look suspiciously like a relational database! Generally, a benefit of relational ontologies is that they do not have a single hierarchy globally imposed upon the data model, but rather can dynamically create new hierarchies specific to the query.

More concretely, we can think in a user-centric way or a group-centric way without changing the data. For example,

```sql
SELECT * FROM users
INNER JOIN
  (SELECT * FROM groups groups ON users.group_id = groups.id
WHERE SUM(groups)
