# Reachability Problems and DFS

## Introduction

Depth-first search, or DFS, is a fundamental graph algorithm that can be used to solve **reachability** problems. This post shows how to adapt the basic DFS template to solve several problems of this kind. Reachability problems are often easier in undirected graphs. Below, we specify if the algorithm works for undirected graphs, directed graphs, or both.

### Prerequisites

We assume that the reader is already familiar with the concept of DFS. [Here](https://www.youtube.com/watch?v=7fujbpJ0LB4) is an excellent video introducing DFS with step-by-step animations. We also assume that the reader is familiar with the adjacency list representation of a graph.

### Coding conventions

The algorithms below are in Python. `n` denotes the number of nodes. Nodes are identified with integers in the range `0..n-1`. The graph `G` is a graph stored as an adjacency list: `G` is a list of `n` lists. For each `v` between `0` and `n-1`, `G[v]` is the list of neighbors of `G`.

If the graph is given as an edge list instead, we can initialize it as follows:

```python
def makeAdjList(edgeList):
    n = max(max(edge) for edge in edgeList) + 1
    G = [[] for v in range(n)]
    for u,v in edgeList:
        G[u].append(v)
        G[v].append(u) #omit this for directed graphs
    return G
```

If the graph is given as an adjacency matrix, we can iterate through the rows of the adjacency matrix instead of through the adjacency lists. To iterate through the neighbors of a node `v`, instead of 
```python
    for nbr in G[v]:
        ...
```
we do
```python
    for u in range(n):
        if adjMatrix[v][u]:
            #u is a nbr of v
            ...
```
Note that using an adjacency matrix affects the runtime analysis of DFS (`O(n^2)` instead of `O(m)`).

## Which nodes can be reached from node s?

This is the simplest question that can be answered with DFS. The primary data structure in DFS is a list of booleans to keep track of already visited nodes (we call it `vis`). If we start a DFS search from a node `s`, the reachable nodes will be the ones for which `vis` is true.

For this `G` can be directed or undirected. We make use of a nested function in Python so that we do not need to pass `G` and `vis` as parameters (in Python nested functions have visibility over the variables in the scope where they are defined).

```python
def reachableNodes(G, s): #G is directed or undirected
    n = len(G)
    vis = n * [False]
    vis[s] = True

    #invariant: v is marked as visited when calling visit(v)
    def visit(v):
        for nbr in G[v]:
            if not vis[nbr]:
                vis[nbr] = True
                visit(nbr) 

    visit(s)
    return [v for v in range(n) if vis[v]]
```

DFS runs in `O(m)` time and `O(n)` space, where `m` is the number of edges. This is because each edge is considered twice, once from each endpoint, if the endpoints end up being visited, or zero times if the endpoints are not visited.

### Iterative version
```python
def reachableNodes(G, s): #G is directed or undirected
    n = len(G)
    vis = n * [False]
    stk = [s]
    #mark nodes as visited when removed from the stack, not when added
    while stk:
        v = stk.pop()
        if vis[v]: continue
        vis[v] = True 
        for nbr in G[v]:
            if not vis[nbr]:
                stk.append(nbr)
    return [v for v in range(n) if vis[v]]
```

The iterative version takes `O(m)` space instead of `O(n)` because nodes can be inserted into the stack multiple times (up to one time for each incident edge). Alternatively, we can mark the nodes as visited when we add them to the stack instead of when we remove them. This change reduces the space usage to the usual `O(n)`. However, with this change, the algorithm is no longer DFS. It still works for answering reachability questions because the set visited nodes is the same, but the order in which they are visited is no longer consistent with a depth-first search order (it is closer to a BFS (breath-first search) order, but also not exactly a BFS order).

The difference between marking nodes when they added vs removed from the stack is discussed in detail [here](https://11011110.github.io/blog/2013/12/17/stack-based-graph-traversal.html). Since the recursive version is shorter and optimal in terms of space, we favor it from now on. That said, it should be easy to adapt the iterative version above to the problems below.

## Can node s reach node t?

We use the same code from before, but we add early termination as soon as we see `t`. Now, the recursive function has a return value.

```python
def canReachNode(G, s, t): #G is directed or undirected
    n = len(G)
    vis = n * [False]
    vis[s] = True

    #returns True if the search reaches t
    def visit(v):
        if v == t: return True
        for nbr in G[v]:
            if not vis[nbr]:
                vis[nbr] = True
                if visit(nbr): return True 
        return False

    return visit(s)
```

Adding the early termination can make the DFS faster, but in the worst-case the time/space complexity is the same.

## Find a path from s to t

The edges "traversed" in a DFS search form a tree called the "DFS tree". The DFS tree changes depending on where we start the search. The starting node is called the root. We can construct the DFS tree by keeping track of the predecessor of each node in the search (the root has no predecessor). If we construct the DFS tree rooted at `s`, we can follow the sequence of predecessors from `t` to `s` to find a path from `s` to `t` in reverse order.

Instead of using the list `vis` to keep track of visited nodes, we know a node is unvisited if it has no predecessor yet. We indicate that a node has no predecessor with the special value `-1`.

```python
def findPath(G, s, t): #G is directed or undirected
    n = len(G)
    pred = n * [-1]
    pred[s] = None
    def visit(v):
        for nbr in G[v]:
            if pred[nbr] == -1:
                pred[nbr] = v
                visit(nbr) 
    visit(s) #builds DFS tree
    path = [t]
    while path[-1] != s:
        p = pred[path[-1]]
        if p == -1: return None #cannot reach t from s
        path.append(p)
    path.reverse()
    return path
```

Note that DFS does *not* find the shortest path form `s` to `t`. For that, we can use BFS (breath-first search). It just returns any path without repeated nodes.

## Is the graph connected?

For undirected graphs, this is almost the same question as the first question ("which nodes can be reached by `s`?") because of the following property:

*An undirected graph is connected if and only if every node can be reached from `s`, where `s` is any of the nodes.*

Thus, the code is exactly the same as for the first question, with two differences: 1) we choose `s` to be `0` (could be anything), and 2) we change the last line to check if every entry in `vis` is true.

```python
def isConnected(G): #G is undirected
    n = len(G)
    vis = n * [False]
    vis[0] = True
    def visit(v):
        for nbr in G[v]:
            if not vis[nbr]:
                vis[nbr] = True
                visit(nbr) 
    visit(0)
    return all(vis)
```

For directed graphs, we need to take into account the direction of the edges. A directed graph is **strongly connected** if every node can reach every other node. We can use the following property:

*A directed graph is strongly connected if and only if `s` can reach every node and every node can reach `s`, where `s` is any of the nodes.*

We already know how to use DFS to check if `s` can reach every node. To check if every node can reach `s`, we can do a DFS starting from `s`, **but in the reverse graph of G**. The reverse graph of `G` is like `G` but reversing the directions of all the edges.

```python
def isConnected(G): #G is directed
    n = len(G)
    vis = n * [False]
    vis[0] = True #use 0 for start node
    def visit(G, v):
        for nbr in G[v]:
            if not vis[nbr]:
                vis[nbr] = True
                visit(G, nbr) 
    visit(G, 0) #nodes reachable from s
    if not all(vis): return False
    Greverse = [[] for v in range(n)]
    for v in range(n):
        for nbr in G[v]:
            Greverse[nbr].append(v)
    vis = n * [False] #reset vis for the second search
    vis[0] = True
    visit(Greverse, 0) #nodes that can reach s
    return all(vis)
```

The runtime is still `O(m)`, but the space is now `O(m)` because we need to create and store the reverse graph. There are alternative algorithms (like Tarjan's algorithm) which can do this in `O(n)` space.

## How many connected components are there?

We can use the typical DFS to answer this question for undirected graphs. We use a common pattern in DFS algorithms: an outer loop through all the nodes where we launch a search for every yet-unvisited node.

```python
def numConnectedComponents(G): #G is undirected
    n = len(G)
    vis = n * [False]
    def visit(v):
        for nbr in G[v]:
            if not vis[nbr]:
                vis[nbr] = True
                visit(nbr) 
    numCCs = 0
    for v in range(n):
        if not vis[v]:
            numCCs += 1
            vis[v] = True
            visit(v)
    return numCCs
```

The runtime is now `O(n+m)` because, if `m < n`, we still spend `O(n)` time iterating through the loop at the end.

For directed graphs, instead of connected components, we talk about **strongly connected components**. A strongly connected component is a maximal subset of nodes where every node can reach every other node. 

If we want to find the number of strongly connected components, we can use something like [Tarjan's algorithm](https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm), a DFS-based algorithm that requires some additional data structures.

### Practice problems
- https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/ (Premium only)
- https://leetcode.com/problems/number-of-islands/
- https://leetcode.com/problems/friend-circles/

## Which nodes are in the same connected components?

This question is more general than the previous two. We label each node `v` with a number `CC[v]` so that nodes with the same number belong to the same CC. Instead of having a list `CC` in addition to `vis`, we use the CC number `-1` to indicate unvisited nodes. This way, we do not need `vis`

```python
def connectedComponents(G): #G is undirected
    n = len(G)
    CC = n * [-1]

    ##invariant: v is labeled with CC i>=0
    def visit(v, i):
        for nbr in G[v]:
            if CC[nbr] == -1:
                CC[nbr] = i
                visit(nbr, i) 

    i = 0
    for v in range(n):
        if CC[v] == -1:
            CC[v] = i
            visit(v, i)
            i += 1
    return CC
```

For directed graphs, again we need Tarjan's algorithm or an equivalent algorithm.

### Practice problems
- https://leetcode.com/problems/max-area-of-island/
- https://leetcode.com/problems/sentence-similarity-ii/

## Is the graph acyclic?

For undirected graphs, this question is simple. First, we consider the problem in each CC independently. This is very common pattern in graph problems. We do this with an outer loop through all the nodes where we launch a search for every yet-unvisited node.

During the DFS search in each CC, if we find an edge to an already visited node that is not the predecessor in the search (the node we just came from), there is a cycle. Such edges in a DFS search are called **back edges**. We add one parameter to the recursive function `visit` to know the predecessor node.

```python
def hasCycles(G): #G is undirected
    n = len(G)
    vis = n * [False]

    #returns True if the search finds a back edge
    def visit(v, p):
        for nbr in G[v]:
            if vis[nbr] and nbr != p: return True
            if not vis[nbr]:
                vis[nbr] = True
                if visit(nbr, v): return True
        return False

    for v in range(n):
        if not vis[v]:
            vis[v] = True
            #the root of the search has no predecessor
            if visit(v, -1): return True
    return False
```

For directed graphs, it is not as simple: the fact that a neighbor `nbr` is already visited during the DFS search does not mean that `nbr` can reach the current node. To check if a directed graph is acyclic, we can use the linear-time [peel-off algorithm](https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm) for finding a topological ordering. This algorithm detects if the graph is acyclic and finds a topological ordering if so, though we are only interested in the first part.


### Practice problems
- https://leetcode.com/problems/redundant-connection/

## Is the graph a tree?

Usually, we ask this question for undirected graphs. We can use this characterization of trees:

*An undirected graph is a tree if and only if it is connected and has exactly `n-1` edges.*

We already saw how to check if the graph is connected with DFS, and counting the number of edges is straightforward:

```python
    #for undirected graphs:
    m = sum(len(G[v]) for v in range(n)) / 2
    #for directed graphs:
    m = sum(len(G[v]) for v in range(n))
```

### Practice problems
- https://leetcode.com/problems/graph-valid-tree/

## Is the graph bipartite?

This is exactly the same question as whether the graph can be two-colored, so see the next section.

## Can the graph be two-colored?

Two-coloring a graph means assigning colors to the nodes such that no two adjacent nodes have the same color, using only two colors. Usually, we consider coloring question for undirected graphs.

We consider whether each CC can be colored independently from the others. We can color each CC using DFS. We use values `0` and `1` for the colors. The color of the start node can be anything, so we set it to `0`. For the remaining nodes, the color has to be different from the parent, so we only have one option.

Instead of having a `vis` array, we use the special color `-1` to denote unvisited nodes. 

```python
def is2Colorable(G): #G is undirected
    n = len(G)
    color = n * [None]

    #returns True if we can color all the nodes reached from v
    #invariant: v has an assigned color
    def visit(v):
        for nbr in G[v]:
            if color[nbr] == color[v]: return False 
            if color[nbr] == -1:
                color[nbr] = 1 if color[v] == 0 else 1
                if not visit(nbr): return False
        return True

    for v in range(n):
        if color[v] == -1:
            color[v] = 0
            if not visit(v): return False
    return True
```

With 3 or more colors, the problem becomes [a lot harder](https://en.wikipedia.org/wiki/Graph_coloring#Algorithms).

### Practice problems
- https://leetcode.com/problems/is-graph-bipartite/

## What is the distance from a node s to every other node in a tree?

We cannot use DFS to find the distance between nodes in a graph which can have cycles, because DFS is not guaranteed to follow the shortest path from the root to the other nodes. For that, BFS is more suitable (if the graph is unweighted). However, since trees are acyclic, there is a unique path between any two nodes, so DFS must use the unique path, which, by necessity, is the shortest path. Thus, we can use DFS to find distances in a tree.

```python
def getDistances(G, s): #G is undirected and a tree
    n = len(G)
    dists = n * [-1]
    dists[s] = 0

    #invariant: v has an assigned distance
    def visit(v):
        for nbr in G[v]:
            #check nbr is not the predecessor
            if dists[nbr] != -1: continue
            dists[nbr] = dists[v] + 1
            visit(nbr)
    visit(s)
    return dists
```

### Practice problems
- https://leetcode.com/problems/time-needed-to-inform-all-employees/

## Find a spanning tree

A spanning tree of a connected, undirected graph `G` is a subgraph which has the same nodes as `G` that is a tree. 
The edges traversed by a DFS search on a connected graph form a spanning tree (sometimes called a DFS tree). Thus, we do DFS and add the traversed edges to the resulting tree.

```python
def spanningTree(G): #G is undirected and connected
    n = len(G)
    vis = n * [False]
    vis[0] = True
    T = [[] for v in range(n)]

    def visit(v):
        for nbr in G[v]:
            if not vis[nbr]:
                vis[nbr] = True
                T[v].append(nbr)
                T[nbr].append(v)
                visit(nbr)
    visit(s)
    return T
```

## Conclusions

DFS is the footprint for many algorithms, from simple to . We showed how to make minor modifications to the DFS template to answer reachability and connectivity questions.

If you know of other problems that can be solved with DFS, let me know!

After DFS, the next algorithm to learn would be BFS (breath-first search). Like DFS, it can answer reachability questions. On top of that, it can also answer questions about distance in undirected graphs.