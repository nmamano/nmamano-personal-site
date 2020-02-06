# Iterative Tree Traversals: A Practical Guide 

## Introduction

I don't know how often tree traversals come up in actual software projects, but they are popular in coding interviews and competitive programming.
In this article, I share an approach for implementing tree traversal algorithms iteratively that I found to be simple to remember and implement, while being flexible enough to do anything that a recursive algorithm can (I also didn't like most suggestions I saw online). The main technique is given in section ["Iterative Postorder and Inorder Traversal"](#technique),  but first I give some context. I also link to practice problems on [leetcode.com](https://leetcode.com) for the reader to play with. I provide some solutions, but I suggest trying the problems out first. The code snippets are in C++, but leetcode accepts most languages.

## What are Tree Traversals

Mathematically, trees are just connected acyclic graphs. However, in the context of tree traversals, we are usually working with **rooted trees** represented with a recursive structure such as the following (which is the default definition in Leetcode for binary trees). A leaf is a node with two null pointers as children:

```C++
    struct TreeNode {
      int val;
      TreeNode *left;
      TreeNode *right;
      TreeNode(int x) : val(x), left(NULL), right(NULL) {}
    };
```

A tree traversal is an algorithm that visits every node in a tree in a specific order (and does some computation with them, depending on the problem). For binary trees specifically, there are three important orders:

* **Preorder:** root before children. As we will see, this is the simplest to implement.
* **Inorder:** left child, then root, then right child. This traversal is most often used on *binary search trees* (BST). A BST is a rooted binary tree with the additional property that every node in the left subtree has a smaller value than the root, and every node in the right subtree has a larger value than the root. This traversal is called "inorder" because, when used on a BST, it will visit the nodes from smallest to largest.
* **Postorder:** children before root. It comes up in problems where we have to aggreate information about the entire subtree rooted at each node. Classic examples are computing the size, the height, or the sum of values of the tree.

![Tree traversals](traversals.svg =50%x50%)

Because rooted trees are recursive data structures, algorithms on trees are most naturally expressed recursively. Here are the three traversals. I use the function `process(node)` as a placeholder for whatever computation the problem calls for.

```C++
    void preorderTraversal(TreeNode* root) {
      if (!root) return;
      process(root);
      preorderTraversal(root->left);
      preorderTraversal(root->right);
    }

    void inorderTraversal(TreeNode* root) {
      if (!root) return;
      inorderTraversal(root->left);
      process(root);
      inorderTraversal(root->right);
    }

    void postorderTraversal(TreeNode* root) {
      if (!root) return;
      postorderTraversal(root->left);
      postorderTraversal(root->right);
      process(root);
    }
```

Sidenote: in C++, pointers are implicitly converted to booleans: a pointer evaluates to true if and only if it is not null. So, in the code above, "`if (!root)`" is equivalent to "`if (root == NULL)`".

### Traversal problems on leetcode
* https://leetcode.com/problems/binary-tree-preorder-traversal/
* https://leetcode.com/problems/binary-tree-inorder-traversal/
* https://leetcode.com/problems/binary-tree-postorder-traversal/

## Why / When to Use an Iterative Traversal

If the recursive implementation is so simple, why bother with an iterative one? Of course, to avoid stack overflow. Most runtime engines/compilers set a limit on how many nested calls a program can make. For example, according to [this article](https://freecontent.manning.com/stack-safe-recursion-in-java/):

> *Default stack size varies between 320k and 1024k depending on the version of Java and the system used. For a 64 bits Java 8 program with minimal stack usage, the maximum number of nested method calls is about 7000.*

If the height of the tree is larger than this limit, the program will crash with a **stack overflow error**. A recursive implementation is safe to use if:
* Somehow we know that the input trees will be small enough. 
* The tree is *balanced*, which means that, for each node, the left and right subtrees have roughly the same height. In a balanced tree, the height is guaranteed to be *logarithmic* on the number of nodes (indeed, that is why balanced BSTs guarantee *O(log n)* search time), so any tree that fits in RAM (or even disk) will require a tiny number of recursive calls.

However, if we are not in either of the cases above, an iterative solution is safer.

Recursive and iterative traversals have the same runtime complexity, so this is not a concern when choosing either (all the problems shown in this article can be solved in linear time using either).

The main approach for converting recursive implementations to iterative ones is to "simulate" the call stack with an actual stack where we push and pop the nodes explicitly. This works great "out-of-the-box" with preorder traversal.

Incidentally, when implementing tree traversals we need to make an implementation choice about how to handle NULL pointers. We can be eager and filter them out before adding them to the stack, or we can be lazy and detect them once we extract them from the stack. Both are fine&mdash;what matters is to be deliberate and consistent about which approach we are using. I prefer the latter as it yields slightly shorter code, so I will use it in all the following examples. For comparison, here is the iterative preorder traversal with both approaches:

```C++
    //eager NULL checking
    void preorderTraversal(TreeNode* root) {
      stack<TreeNode*> stk;
      if (!root) return;
      stk.push(root);
      while (!stk.empty()) {
        TreeNode* node = stk.top();
        stk.pop();
        process(node);
        if (node->right) stk.push(node->right);
        if (node->left) stk.push(node->left);
      }
    }

    //lazy NULL checking
    void preorderTraversal(TreeNode* root) {
      stack<TreeNode*> stk;
      stk.push(root);
      while (!stk.empty()) {
        TreeNode* node = stk.top();
        stk.pop();
        if (!node) continue;
        process(node);
        stk.push(node->right);
        stk.push(node->left);
      }
    }
```

Note that **the right child is pushed to the stack before the left one**. This is because we want the left child to be above in the stack so that it is processed first.

### Preorder traversal practice problems
* https://leetcode.com/problems/invert-binary-tree/
* https://leetcode.com/problems/maximum-depth-of-binary-tree/

This problem asks to find the depth of a binary tree (follow the link for the description and examples). It requires passing information from each node to its children. We can do this by changing the stack to `stack<pair<TreeNode*, int>>`, so that we can pass an `int` to each child, as in the solution below:

```C++
    int maxDepth(TreeNode* root) {
        int res = 0;
        stack<pair<TreeNode*, int>> stk;
        stk.push({root, 1}); //node, depth
        while (!stk.empty()) {
            auto node = stk.top().first;
            int depth = stk.top().second;
            stk.pop();
            if (!node) continue;
            res = max(res, depth);
            stk.push({node->left, depth+1});
            stk.push({node->right, depth+1});
        }
        return res;
    }
```

In the code above, the `{}` notation is used to create pairs (e.g., `{root, 0}`). If one is not familiar with pairs in C++, or is using a language without the equivalent, a simple alternative is to use two separate stacks, one for the nodes and one for the info. 

The next two problems are similar:
* https://leetcode.com/problems/minimum-depth-of-binary-tree/
* https://leetcode.com/problems/path-sum/
* https://leetcode.com/problems/symmetric-tree/

A solution for the last one, this time using a stack with a pair of nodes:

```C++
    bool isSymmetric(TreeNode* root) {
        if (!root) return true;
        stack<pair<TreeNode*, TreeNode*>> stk;
        stk.push({root->left, root->right});
        while (!stk.empty()) {
            TreeNode* l = stk.top().first;
            TreeNode* r = stk.top().second;
            stk.pop();
            if (!l and !r) continue;
            if (!l or !r or l->val != r->val) return false;
            stk.push({l->left, r->right});
            stk.push({l->right, r->left});
        }
        return true;
    }
```

## <a name="technique"></a>Iterative Postorder and Inorder Traversal
While iterative preorder traversal is straightforward, with postorder and inorder we run into a complication: we cannot simply swap the order of the lines as with the recursive implementation. In other words, the following does *not* yield a postorder traversal:

```C++
        ...
        stk.push(node->right);
        stk.push(node->left);
        process(node);
        ...
```

The node is still processed before its children, which is not what we want.

**The workaround, once again emulating the recursive implementation, is to visit each node twice.** We consider postorder traversal first. In the first visit, we only push the children onto the stack. In the second visit, we do the actual processing.
The simplest way to do this is to enhance the stack with a **"visit number flag"**. Implementation-wise, we change the stack to `stack<pair<TreeNode*, int>>` so that we can pass the flag along with each node. The iterative postorder looks like this:

```C++
    void postorderTraversal(TreeNode* root) {
      stack<pair<TreeNode*,int>> stk; //node, visit #
      stk.push({root, 0});
      while (!stk.empty()) {
        TreeNode* node = stk.top().first;
        int visit = stk.top().second;
        stk.pop();
        if (!node) continue;
        if (visit == 0) {
          stk.push({node, 1});
          stk.push({node->right, 0});
          stk.push({node->left, 0});
        } else { //visit == 1
          process(node);
        }
      }
    }
```

Note the order in which the nodes are added to the stack when `visit == 0`. The parent ends up under its children, with the left child on top. Since it is the first time that the children are added to the stack, their visit-number flag is 0. For the parent, it is 1.
For simplicity, I also follow the convention to always immediately call pop after extracting the top element from the stack.

The same approach also works for inorder traversal (that's the point). Here is a version where we visit each node three times: one to push the left child, one to process the node, and one to push the right child.

```C++
    //3-visit version
    void inorderTraversal(TreeNode* root) {
      stack<pair<TreeNode*,int>> stk;
      stk.push({root, 0});
      while (!stk.empty()) {
        TreeNode* node = stk.top().first;
        int visit = stk.top().second;
        stk.pop();
        if (!node) continue;
        if (visit == 0) {
          stk.push({node, 1});
          stk.push({node->left, 0});
        } else if (visit == 1) {
          stk.push({node, 2});
          process(node);
        } else { //visit == 2
          stk.push({node->right, 0});
        }
      }
    }
```

In fact, the second and third visits can be merged together: processing the node does not modify the stack, so the two visits are followed one after the other anyway. Here is my preferred version:

```C++
    //2-visit version
    void inorderTraversal(TreeNode* root) {
      stack<pair<TreeNode*,int>> stk;
      stk.push({root, 0});
      while (!stk.empty()) {
        TreeNode* node = stk.top().first;
        int visit = stk.top().second;
        stk.pop();
        if (!node) continue;
        if (visit == 0) {
          stk.push({node, 1});
          stk.push({node->left, 0});
        } else { //visit == 1
          process(node);
          stk.push({node->right, 0});
        }
      }
    }
```

For completeness, here is the version found in most of my top Google hits (see [this](https://www.techiedelight.com/inorder-tree-traversal-iterative-recursive/) for a nice explanation):

```C++
    void inorderTraversal(TreeNode* root) { 
        stack<TreeNode*> stk; 
        TreeNode* curr = root; 
        while (curr or !stk.empty()) { 
            while (curr) { 
                stk.push(curr); 
                curr = curr->left; 
            } 
            curr = stk.top(); 
            stk.pop();
            process(curr); 
            curr = curr->right; 
        }
    } 
```

While it is shorter, it cannot be easily converted to postorder traversal, so it is not as flexible. Also, I find it easier to follow the execution flow with the visit-number flag.

### Inorder traversal practice problems

* https://leetcode.com/problems/kth-smallest-element-in-a-bst/

A solution (follow the link for the statement and examples):

```C++
    int kthSmallest(TreeNode* root, int k) {
        int count = 1;
        stack<pair<TreeNode*, int>> stk;
        stk.push({root, 0});
        while (!stk.empty()) {
            auto node = stk.top().first;
            int visit = stk.top().second;
            stk.pop();
            if (!node) continue;
            if (visit == 0) {
                stk.push({node, 1});
                stk.push({node->left, 0});
            } else { //visit == 1
                if (count == k) return node->val;
                count++;
                stk.push({node->right, 0});
            }
        }
        return -1;
    }
```

* https://leetcode.com/problems/validate-binary-search-tree/

A solution:

```C++
    bool isValidBST(TreeNode* root) {
        int lastVal;
        bool init = false;
        
        stack<pair<TreeNode*, int>> stk;
        stk.push({root, 0});
        while (!stk.empty()) {
            TreeNode* node = stk.top().first;
            int visit = stk.top().second;
            stk.pop();
            if (!node) continue;
            if (visit == 0) {
                stk.push({node, 1});
                stk.push({node->left, 0});
            } else { //second visit
                if (!init) {
                    init = true;
                    lastVal = node->val;
                } else {
                    if (node->val <= lastVal) return false;
                    lastVal = node->val;
                }
                stk.push({node->right, 0});
            }
        }
        return true;
    }
```

### Postorder traversal practice problems

* https://leetcode.com/problems/balanced-binary-tree/

This problem asks to check if a binary tree is balanced. It requires passing information back from the children to the parent node in a postorder traversal. Passing information from the children to the parent is easy with recursion. It can be done both with return values or with parameters passed by reference. For this problem we need to pass two things: a `bool` indicating if the subtree is balanced, and an `int` indicating its height. I use a referece parameter for the latter (returning a `pair<bool,int>` would be cleaner).

```C++
    bool isBalancedRec(TreeNode* root, int& height) {
      if (!root) {
        height = 0;
        return true;
      }
      int lHeight, rHeight;
      bool lBal = isBalancedRec(root->left, lHeight);
      bool rBal = isBalancedRec(root->right, rHeight);
      height = max(lHeight, rHeight) + 1;
      return lBal && rBal && abs(lHeight - rHeight) <= 1;
    }

    bool isBalanced(TreeNode* root) {
      int height;
      return isBalancedRec(root, height);
    }
```

Passing information from the children to the parent in an interative implementation is more intricate. There are three general approaches:

1. Use a hash table mapping each node to the information.

This is the easiest way, but also the most expensive.
While the asymptotic runtime is still linear, hash tables generally have significant constant factors.

```C++
    bool isBalanced(TreeNode* root) {
        stack<pair<TreeNode*, int>> stk;
        stk.push({root, 0});

        unordered_map<TreeNode*, int> height;
        height[NULL] = 0;
        
        while (!stk.empty()) {
            TreeNode* node = stk.top().first;
            int visit = stk.top().second;
            stk.pop();
            if (!node) continue;
            if (visit == 0) {
                stk.push({node, 1});
                stk.push({node->right, 0});
                stk.push({node->left, 0});
            } else { // visit == 1
                int lHeight = height[node->left], rHeight = height[node->right];
                if (abs(lHeight - rHeight) > 1) return false;
                height[node] = max(lHeight, rHeight) + 1;
            }
        }
        return true;
    }
```

2. Add a field to the definition of the node structure for the information needed.

Then, we can read it from the parent node by traversing the children's pointers.
In Leetcode we cannot modify the `TreeNode` data structure so, to illustrate this approach, I build a new tree first with a new struct:

```C++
    struct MyNode {
        int val;
        int height;
        MyNode *left;
        MyNode *right;
        MyNode(TreeNode* node): val(node->val), height(-1), left(NULL), right(NULL) {
            if (node->left) left = new MyNode(node->left);
            if (node->right) right = new MyNode(node->right);
        }
    };
    
    bool isBalanced(TreeNode* root) {
        if (!root) return true;
        MyNode* myRoot = new MyNode(root);
        stack<pair<MyNode*, int>> stk;
        stk.push({myRoot, 0});
        while (!stk.empty()) {
            MyNode* node = stk.top().first;
            int visit = stk.top().second;
            stk.pop();
            if (!node) continue;
            if (visit == 0) {
                stk.push({node, 1});
                stk.push({node->right, 0});
                stk.push({node->left, 0});
            } else { // visit == 1
                int lHeight = 0, rHeight = 0;
                if (node->left) lHeight = node->left->height;
                if (node->right) rHeight = node->right->height;
                if (abs(lHeight - rHeight) > 1) return false;
                node->height = max(lHeight, rHeight) + 1;
            }
        }
        return true;
    }
```

3. Pass the information through an additional stack.

This is the most efficient, but one must be careful to keep both stacks in synch. When processing a node, that node first pops the information from its children, and then pushes its own info for its parent. Here is a solution (with eager NULL-pointer detection):
   
```C++
    bool isBalanced(TreeNode* root) {
        if (!root) return true;
        stack<pair<TreeNode*, int>> stk;
        stk.push({root, 0});

        stack<int> heights;
        
        while (!stk.empty()) {
            TreeNode* node = stk.top().first;
            int visit = stk.top().second;
            stk.pop();
            if (visit == 0) {
                stk.push({node, 1});
                if (node->right) stk.push({node->right, 0});
                if (node->left) stk.push({node->left, 0});   
            } else { // visit == 1
                int rHeight = 0, lHeight = 0;
                if (node->right) {
                    rHeight = heights.top();
                    heights.pop();
                }
                if (node->left) {
                    lHeight = heights.top();
                    heights.pop();
                }
                if (abs(lHeight - rHeight) > 1) return false;
                heights.push(max(lHeight, rHeight) + 1);
            }
        }
        return true;
    }
```

* https://leetcode.com/problems/diameter-of-binary-tree/

This problem also requires passing information from the children to the parent in a postorder traversal. Here is a solution using the third approach again, but this time with lazy NULL-pointer detection. Note that we push a 0 to the `dephts` stack when we extract a NULL pointer from the main stack, and during processing we always do two pops regardless of the number of non-NULL children:

```C++
    int diameterOfBinaryTree(TreeNode* root) {
        stack<pair<TreeNode*,int>> stk; 
        stk.push({root, 0});
    
        stack<int> depths;
        int res = 0;
    
        while (!stk.empty()) {
            TreeNode* node = stk.top().first;
            int visit = stk.top().second;
            stk.pop();
            if (!node) {
                depths.push(0);
                continue;
            }
            if (visit == 0) {
                stk.push({node, 1});
                stk.push({node->right, 0});
                stk.push({node->left, 0});
            } else { //visit == 1
                int rDepth = depths.top();
                depths.pop();
                int lDepth = depths.top();
                depths.pop();
                int depth = max(lDepth, rDepth) + 1;
                depths.push(depth);
                int dia = lDepth + rDepth;
                res = max(res, dia);
            }
        }
        return res;
    }
```

* https://leetcode.com/problems/binary-tree-tilt/
* https://leetcode.com/problems/most-frequent-subtree-sum/
* https://leetcode.com/problems/maximum-product-of-splitted-binary-tree/


## Traversals in n-ary Trees

So far, we have looked at binary trees. In an n-ary tree, each node has an arbitrary number of children.

```C++
    struct Node {
        int val;
        vector<Node*> children;
        Node(int val): val(val), children(0) {}
    };
```

For n-ary trees, preorder traversal is also straightforward, and inorder traversal is not defined.

For postorder traversal, we can use a visit-number flag again. Two visits suffice for each node: one to push all the children into the stack, and another to process the node itself. I do not include the code here because it is very similar to the binary tree case.

Consider a more complicated setting where we need to compute something at the node after visiting each child. Let's call this "interleaved traversal". I use `process(node, i)` as placeholder for the computation done before visiting the i-th child. Here is the recursive implementation and the corresponding iterative one using visit-number flags.

```C++
    //recursive
    void interleavedTraversal(Node* root) {
      if (!root) return;
      int n = root->children.size();
      for (int i = 0; i < n; i++) {
        process(root, i);
        interleavedTraversal(root->children[i]);
      }
    }

    //iterative
    void interleavedTraversal(Node* root) {
      stack<pair<TreeNode*, int>> stk;
      stk.push({root, 0});
      while (!stk.empty()) {
        TreeNode* node = stk.top().first;
        int visit = stk.top().second;
        stk.pop();
        if (!node) continue;
        int n = node->children.size();
        if (visit < n) {
          stk.push({node, visit+1});
          process(node, visit);
          stk.push({node->children[visit], 0});
        }
      }
    }
```

### N-ary tree practice problems
* https://leetcode.com/problems/n-ary-tree-preorder-traversal/
* https://leetcode.com/problems/n-ary-tree-postorder-traversal/

## An Alternative Way of Passing the Visit Flag

The common framework to all our solutions has been to pass a visit-number flag along with the nodes on the stack. User "heiswyd" on Leetcode posted [here](https://leetcode.com/problems/binary-tree-postorder-traversal/discuss/45582/A-real-Postorder-Traversal-.without-reverse-or-insert-4ms) an alternative way to pass the flag implicitly: initially, it pushes each node on the stack twice. Then, it can distinguish between the first visit and the second visit by checking whether the node that has just been extracted from the stack matches the node on top of the stack. This happens only when we extract the first of the two occurrences. Post-order traversal looks like this:

```C++
    void postorderTraversal(TreeNode* root) {
      stack<TreeNode*> stk;
      stk.push(root);
      stk.push(root);
      while (!stk.empty()) {
        TreeNode* node = stk.top();
        stk.pop();
        if (!node) continue;
        if (!stk.empty() and stk.top() == node) {
          stk.push(node->right);
          stk.push(node->right);
          stk.push(node->left);
          stk.push(node->left);
        } else {
          process(node);
        }
      }
    }
```

It is cool, but I prefer passing the flag explicitly for clarity.


