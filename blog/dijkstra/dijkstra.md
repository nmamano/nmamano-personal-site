# Actually Implementing Dijkstra's Algorithm 

## Introduction

Dijkstra's algorithm for the shortest-path problem is one of the most important graph algorithms, so it is often covered in algorithm classes. However, going from the pseudocode to an actual implementation is made difficult by the fact that it relies on a priority queue with a "decrease key" operation. While most programming languages offer a priority queue data structure as part of their standard library, this operation is generally not supported (e.g., in C++, Java or Python). In this blog, we go over the different ways to implement Dijkstra's algorithm with and without this operation, and the implications of using each. All in all, we consider 5 versions of Dijkstra:

- **Textbook Dijkstra**: the version commonly taught in textbooks where we assume that we have a priority queue with the "decrease key" operation. As we said, this often does not hold true in reality.
- **Linear-search Dijkstra**: the most naive implementation, but which is actually optimal for dense graphs.
- **Lazy Dijkstra**: practical version which does not use the "decrease key" operation at all, at the cost of using some extra space.
- **BST Dijkstra**: version which uses a self-balancing binary search tree to implement the priority queue functionality, including the "decrease key" operation.
- **Theoretical Dijkstra**: version that uses a Fibonacci heap for the priority queue in order to achieve the fastest possible runtime in terms of big-O notation. This is actually impractical due to the complexity and high constant factors of the Fibonacci heap.

We provide implementations in Python and C++. The initial sections are mostly background. If you are already familiar with Dijkstra's algorithm, you can skip to the code snippets.

## The shortest-path problem

The input consists of a graph `G` and a special node `s`. The edges of `G` are directed and have non-negative weights. The edge weights represent the "lengths" of the edges. The goal is to find the distance from `s` to every other node in `G`. The distance from `s` to another node is the length of the shortest path from `s` to that node, and the length of a path is the sum of the lengths of its edges. If a node is unreachable from `s`, then we say that the distance is infinite.

More precisely, this is known as the "single-source shortest-path" (SSSP) problem, because we find the distance from one node to every other node. Related problems include the "all-pairs shortest paths" problem and the single-source single-destination problem. Dijkstra's algorithm is a really efficient algorithm for the SSSP problem when the edges are non-negative. Dijkstra's algorithm does not work in the presence of negative edges (zero-weight edges are fine). If `G` contains negative edges, we should use the Bellman-Ford algorithm instead.

The constraint that the edges are directed is not important: if `G` is undirected, we can simply replace every undirected edge `{u,v}` with a pair of directed edges `(u,v)` and `(v,u)` in opposite directions and with the weight of the original edge. 

To simplify things, we make a couple of assumptions that do not make any actual difference:
- Nodes not reachable by `s` play no role in the algorithm, so we assume that `s` can reach every node. This is so that, in the analysis, we can assume that `n=O(m)`, where `n` is the number of nodes and `m` the number of edges.
- We assume that the distance from `s` to every node is unique. This allows us to talk about "the" shortest path to a node, when in general there could be many.

## The graph's representation

A graph is a mathematical concept. In the context of graph algorithms, we need to specify how the graph is represented as a data structure. For Dijkstra's algorithm, the most convenient representation is the adjacency list. The valuable thing about the adjacency list representation is that it allows us to iterate through the out-going edges of a node efficiently.

In the version of the adjacency list that we use, each node is identified with an index from `0` to `n-1`, where `n` is the number of nodes. The adjacency list contains one list for each node. For each node `u` between `0` and `n-1`, the list `G[u]` contains one entry for each neighbor of `u`. In a directed graph, if we have an edge `(u,v)` from `u` to `v`, we say that `v` is a neighbor of `u`, but `u` is not a neighbor of `v`. Since the graph is weighted, the entry for each neighbor `v` consists of a pair of values, `(v, l)`: the destination node `v`, and the length `l` of the edge `(u,v)`.


## Dijkstra's algorithm idea

One of the data structures that we maintain is a list `dist` where `dist[u]` is the best distance known for `u` so far. At the beginning, `dist[s] = 0`, and for every other node `dist[u] = infinity`. These distances improve during the algorithm as we consider new paths. Our goal is to get to the point where `dist` contains the correct distance for every node.

During the algorithm, the `dist` list is only updated through an operation called "relaxing" an edge.

```Python
def relax(u,v,l): #l is the length of the edge (u,v)
    if dist[u] + l < dist[v]:
        dist[v] = dist[u] + l
```

In words, relaxing an edge `(u,v)` means checking if going to `u` first and then using the edge `(u,v)` is shorter than the best distance known for `v`. If it is shorter, then we update `dist[v]` to the new, better value.

Dijkstra's algorithm is based on the following observations:

- if `dist[u]` is correct **and** the shortest path from `s` to `v` ends in the edge `(u,v)`, then if we relax the edge `(u,v)`, we will find the correct distance to `v`. If either of the conditions are not satisfied, relaxing `(u,v)` may improve `dist[v]`, but it will not be the correct distance.
- To find the correct distance to `v`, we need to relax all the edges in the shortest path from `s` to `v`, in order. If we do it in order, each node in the path will have the correct distance when we relax the edge to the next node, satisfying the conditions.

Dijkstra's algorithm is efficient because every edge is relaxed only once (unlike other algorithms like Bellman-Ford, which relaxes the edges multiple times). To relax every edge only once, we must relax the out-going edges of each node only after we have found the correct distance for that node.

At the beginning, only `s` has the correct distance, so we relax its edges. This updates the entries in `dist` for its neighbors. The neighbor of `s` that is closest to `s`, say, `x`, has the correct distance at this point. This is because every other path from `s` to `x` starts with a longer edge, and, since the graph does not have negative-weight edges, additional edges can only increase the distance. Next, since `x` has the correct distance, we can relax its out-going edges. After that, the node `y` with the 3rd smallest distance in `dist` (after `s` and `x`) has the correct distance because the node before `y` in the shortest path from `s` to `y` must be either `s` or `x`. It cannot be any other node because simply reaching any node that is not `s` or `x` is already more expensive than the distance we have found for `y`. We continue relaxing the out-going edges of nodes, always taking the next node with the smallest found distance. By generalizing the argument above, when we relax the out-going edges of each node, that node already has the correct distance. We finish after we have gone through all the nodes. At that point, `dist` contains the correct distance for every node.

```
High-level pseudocode of Dijkstra's algorithm

dijkstra(G, s):
    dist = list of length n initialized with INF everywhere except for a 0 at position s
    mark every node as unvisited
    while there are unvisited nodes:
        u = unvisited node with smallest distance in dist
        mark u as visited
        for each edge (u,v):
            relax((u,v))
```

In order to implement Dijkstra's algorithm, we need to decide the data structures used to find the unvisited node with the smallest distance at each iteration.

## Priority queues

Priority queues are data structures that are useful in many applications, including Dijkstra's algorithm.

In a normal queue, we can insert new elements and extract the oldest element. A priority queue is similar, but we can associate a priority with each element. Then, instead of extracting the oldest element, we extract the one with highest priority. Depending on the context, "highest priority" can mean the element with the smallest or largest priority value. In this context, we will consider that the highest priority is the element with the smallest priority value.

A priority queue is an *abstract* data structure. That means that it only specifies which operations it supports, but not how they are implemented. There actually exist many ways to implement a priority queue. To make matters more confusing, different priority queues implementations support different sets of operations. The only agreed part is that they must support two basic operations:

- `insert(e, k)`: insert element `e` with priority `k`.
- `extract_min()`: remove and return the element with the smallest priority value.

For Dijkstra's algorithm, we can use a priority queue to maintain the nodes, using `dist[u]` as the priority for a node `u`. Then, at each iteration we can extract the unvisited node with the smallest distance. However, there is a problem: when we relax an edge, the value `dist[u]` may decrease. Thus, we need the priority queue to support a third operation which is not commonly supported:

- `change_priority(e, k)`: set the priority of `e` to `k` (assuming that `e` is in the priority queue).

A related operation is removing elements that are not the most prioritary:

- `remove(e)`: remove `e` (assuming that `e` is in the priority queue).

If a priority queue implements remove, we can use it to obtain the same functionality as `change-priority(e, k)`: we can first call `remove(e)` and then reinsert the element with the new key by calling `insert(e, k)`.

## Pseudocode with a priority queue

Assuming that we have a priority queue data structure that supports `insert`, `extract-min`, and `change-priority`, Dijkstra's pseudocode would be as follows.

The priority queue contains the unvisited nodes, prioritized by distance from `s`. At the beginning, the priority queue contains all the nodes, and they are removed as they are visited.

```
Dijkstra pseudocode (with a priority queue)

dijkstra(G, s):
    dist = list of length n initialized with INF everywhere except for a 0 at position s
    PQ = empty priority queue
    for each node u: PQ.insert(u, dist[u])
    while not PQ.empty():
        u = PQ.extract_min()
        for each edge (u,v) of length l:
            if dist[u]+l < dist[v]:
                dist[v] = dist[u]+l
                PQ.change_priority(v, dist[v])
```

A common variation is to add them to the priority queue when they are reached for the first time, instead of adding all the nodes at the beginning. The only change is how the priority queue is initialized and the if-else cases at the end:

```
Dijkstra pseudocode (with deferred insertions to the PQ)

dijkstra(G, s):
    dist = list of length n initialized with INF everywhere except for a 0 at position s
    PQ = empty priority queue
    PQ.insert(s, 0)
    while not PQ.empty():
        u = PQ.extract_min()
        for each edge (u,v) of length l:
            if dist[u]+l < dist[v]:
                dist[v] = dist[u]+l
                if v in PQ: PQ.change_priority(v, dist[v])
                else: PQ.insert(v, dist[v])
```

It does not change the runtime or space complexity, but there is also no downside to deferring insertions to the PQ. On average, the PQ will contains fewer elements.

## Analysis of Dijkstra's algorithm

Let `n` be the number of nodes and `m` the number of edges.

Usually, we analyze the algorithms *after* implementing them. However, in order to choose the best data structure for the priority queue, we need to analyze how much we use each type of operation.
Thus, it is convenient to define the runtime in terms of the priority queue operations, without specifying yet how they are done. Let `T_ins`, `T_min`, and `T_change` be the time per `insert`, `extract_min`, and `change_priority` operation, respectively, on a priority queue containing `n` elements. 

The main `while` loop has `n` iterations, and the total number of iterations of the inner `for` loop, across all `n` iterations, is `m`. This is because each edge is relaxed once.

The runtime is dominated by the priority queue operations, so it is `O(n*T_ins + n*T_min + m*T_change)`. These operations dominate the runtime because everything else combined (like updating the `dist` list) takes `O(n+m)` time.

## Linear-search Dijkstra for dense graphs

The simplest way to simulate the `extract_min` functionality of a priority queue is to iterate through the entire `dist` list to find the smallest value among the non-visited entries. If we do this, we don't need a priority queue. We call this **linear-search Dijkstra**.  We get `T_ins = O(1)`, `T_min = O(n)`, and `T_change = O(1)`. Plugging those in, the total runtime of linear-search Dijkstra is `O(n + n*n + m) = O(n^2)`, where we simplify out the `m` term because `n^2 > m` in any graph. More precisely, a directed graph with `n` nodes has at most `n*(n-1)=O(n^2)` edges.

A graph with "close to" `n*(n-1)` edges is called dense. **Linear-search Dijkstra is actually optimal for dense graphs.** This is because Dijkstra's algorithm must take `O(m)` time just to relax all edges, so it cannot be faster than `O(m)`, and, in dense graphs that is already proportional to `O(n^2)`.

Here is a Python implementation:

```Python
def linearSearchDijkstra(G, s):
    n = len(G)
    INF = 9999999
    dist = [INF for node in range(n)]
    dist[s] = 0
    vis = [False for node in range(n)]
    for i in range(n):
        u = -1
        for v in range(n):
            if not vis[v] and (u == -1 or dist[v] < dist[u]):
                u = v
        if dist[u] == INF: break #no more reachable nodes
        vis[u] = True
        for v, l in G[u]:
            if dist[u] + l < dist[v]:
                dist[v] = dist[u] + l
    return dist
```

And C++. We omit the includes and "`using namespace std;`".

```C++
vector<int> linearSearchDijkstra(const vector<vector<pair<int,int>>>& G, int s) {
    int n = G.size();
    vector<int> dist(n, INT_MAX);
    dist[s] = 0;
    vector<int> vis(n, false);
    for (int i = 0; i < n; i++) {
        int u = -1;
        for (int v = 0; v < n; v++)
            if (not vis[v] and (u == -1 or dist[v] < dist[u]))
                u = v;
        if (dist[u] == INT_MAX) break; //no more reachable nodes
        vis[u] = true;
        for (auto edge : G[u]) {
            int v = edge.first, l = edge.second;
            if (dist[u]+l < dist[v])
                dist[v] = dist[u]+l;
        }        
    }
    return dist;
}
```

## Priority queues for sparse graphs

The `O(n^2)` time from the implementation above is slow if the graph `G` is sparse, meaning that the number of edges is small relative to `O(n^2)`. Recall that the time is `O(n*T_ins + n*T_min + m*T_change)`. If `m` is more similar to `n` than to `n^2`, then we would be happy to trade a slower `change_priority` time for a faster `extract_min` time.

The best possible answer in terms of big-O notation is to use a priority queue implementation based on a data structure known as a **Fibonacci Heap**. A Fibonacci heap containing at most `n` elements achieves the following times:
- `insert`: `O(log n)` amortized time.
- `extract_min`: `O(log n)` amortized time.
- `change_priority`: `O(1)` amortized time.

Amortized time means that it could take more time, but, if we average out the times for that operation across the execution of an algorithm, each one takes that time on average.

Using a Fibonacci heap, we get a total time of `O(n*log n + m)` for Dijkstra's algorithm. This is really fast in terms of big-O notation, but Fibonacci heaps have larger constant factors than other data structures, making them slower in practice.

The most common way to implement a priority queue is with a **binary heap**. It is simple and fast in practice. Binary heaps support `insert` and `extract_min` in `O(log n)` like a Fibonacci heap. However, they do not support the `change_priority` operation.

It is possible to modify a binary heap to to support the `change_priority` operation in `O(log n)` time. The result is sometimes called an "indexed priority queue". Using an indexed priority queue, we would get a total runtime of `O(n*log n + m*log n) = O(m*log n)`. This is slightly worse than with a Fibonacci heap, and faster in practice.

In any case, the priority queues provided by languages like C++, Python, and Java, do not support the `change_priority` operation. This creates a disconnect between the pseudocode taught in classrooms and the actual code that we can write.

The goal of this post is to illustrate the options to deal with this issue. There are 3:
- **Textbook Dijkstra**: find or implement our own indexed priority queue.
- **Lazy Dijkstra**: we implement Dijkstra without using the `change_priority` operation at all.
- **BST Dijkstra**: we use a self-balancing binary search tree as the priority queue.

We will cover the latter two options. The first option is an interesting exercise in data structures (I [implemented](
https://github.com/nmamano/StableDistricting/blob/master/src/graphmatching/BinaryHeap.java) it once for a project), but it is more about the inner workings of binary heaps than it is about Dijkstra's algorithm.

All three options have a runtime of `O(m*log n)`. Note that for dense graphs, this becomes `O(n^2 log n)` time, so they are all worse than the naive linear-search Dijkstra. In terms of space, lazy Dijkstra is worse than the others, as it needs `O(m)` space, as opposed to `O(n)` for the other options.

## Lazy Dijkstra

We implement Dijkstra using a priority queue that does not support the change-priority operation. We need the following change: when we find a shorter distance to a node that is already in the priority-queue, instead of using the "change-priority" operation, we simply use an "insert" operation and add a copy of the node in the priority queue with the new distance. Then, when we extract a node from the priority queue, we ignore it if it is not the first time we extract that node. We call this version of Dijkstra "lazy Dijkstra" because we "postpone" the removal of the pre-existing copy of the node.


Here is a Python version. The logical structure of a binary heap is a binary tree, but, internally [the tree is represented as an array](https://en.wikipedia.org/wiki/Binary_heap#Heap_implementation) for efficiency reasons. Python is a bit whack because, instead of having a priority queue module that encapsulates the implementation, we have the [heapq](https://docs.python.org/3/library/heapq.html) module, which provides priority queue operations that can be used directly on a list representing a binary heap. `heapq` offers functions `heappop` (equivalent to `extract_min`) and `heappush` (equivalent to `insert`). These functions receive a normal Python list as a parameter, and this list is assumed to represent a binary heap. In Python, if the priority queue contains tuples, then the first element in the tuple is the priority. Thus, in the implementation we insert tuples to the priority queue with the distance first and the node second.

```Python
def lazyDijkstra(G, s):
    n = len(G)
    INF = 9999999
    dist = [INF for u in range(n)]
    dist[s] = 0
    vis = [False for u in range(n)]
    PQ = [(0, s)]
    while len(PQ) > 0:
        _, u = heappop(PQ) #only need the node, not the distance
        if vis[u]: continue #not first extraction
        vis[u] = True
        for v, l in G[u]:
            if dist[u]+l < dist[v]:
                dist[v] = dist[u]+l
                heappush(PQ, (dist[u]+l, v))
    return dist
```

Here is a C++ version:

```C++
vector<int> lazyDijkstra(const vector<vector<pair<int,int>>>& G, int s) {
    int n = G.size();
    vector<int> dist(n, INT_MAX);
    dist[s] = 0;
    vector<int> vis(n, false);
    //PQ of (distance, node) pairs prioritized by smallest distance
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> PQ;
    PQ.push({0, s});
    while (not PQ.empty()) {
        int u = PQ.top().second;
        PQ.pop();
        if (vis[u]) continue; //not first extraction
        vis[u] = true;
        for (auto edge : G[u]) {
            int v = edge.first, l = edge.second;
            if (dist[u]+l < dist[v]) {
                dist[v] = dist[u]+l;
                PQ.push({dist[v], v});
            }
        }
    }
    return dist;
}
```

Analysis: since nodes can be added to the priority queue multiple times, in lazy Dijkstra the maximum number of elements in the priority queue increases from `O(n)` to `O(m)`. As a result, we do `O(m)` `extract_min` and `insert` operations. The total runtime is `O(m*log m)`. This can be simplified to `O(m*log n)`, because `log m < log (n^2) = 2 log n = O(log n)`. Thus, in terms of big-O notation, **lazy Dijkstra is equally fast as textbook Dijkstra** (Dijkstra with an indexed priority queue). The only thing that got worse is the space used by the priority queue.

## BST Dijkstra

Self-balancing binary search trees, like red-black trees or AVL trees, are a type of data structure that maintains a set of elements ordered according to values associated with the elements, known as the elements' keys. They support a few operations, all in `O(log n)` time. For our use case, we are interested in the following ones:
- Insert an element with a given key.
- Find the element with the smallest/largest key.
- Given a key, find if there is an element with that key, and optionally remove it.

These operations allow us to use a self-balancing BST to implement a priority queue. With the third operation, we can even implement the `change_priority` operation, as we mentioned.

Python does not actually have a self-balancing binary search tree module (why?!), so we cannot implement this version of Dijkstra either without finding or implementing our own self-balancing BST.

Here is a C++ version. In C++, the set data structure is implemented as a self-balancing BST:

```C++
vector<int> bstDijkstra(const vector<vector<pair<int,int>>>& G, int s) {
    int n = G.size();
    vector<int> dist (n, INT_MAX);
    dist[s] = 0;
    //self-balancing BST of (distance, node) pairs, sorted by smallest distance
    set<pair<int, int>> PQ; 
    PQ.insert({0, s});
    while (not PQ.empty()) {
        int u = PQ.begin()->second; //extract-min
        PQ.erase(PQ.begin());
        for (auto edge : G[u]) {
            int v = edge.first, l = edge.second;
            if (dist[u]+l < dist[v]) {
                //erase and insert instead of change-priority 
                PQ.erase({dist[v], v}); 
                dist[v] = dist[u]+l;
                PQ.insert({dist[v], v});
            }
        }
    }
    return dist;
}
```

## Practice problems

- https://leetcode.com/problems/network-delay-time/
- https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/
- https://leetcode.com/problems/reachable-nodes-in-subdivided-graph/
- https://leetcode.com/problems/path-with-maximum-minimum-value/
(Premium only)
