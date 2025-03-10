# Pay per task model

We are introducing a new method for pricing and we have defined several task
categories that describe the execution boundaries. We'll setup a test
infrastructure so that application developers can evaluate the category of their
submissions. Conversely, worker pools will be able to benchmark their
infrastructures against the reference machine.

In the future, we'll redefine the categories, and provide more advanced tools
for helping developers to maximize the usage of the infrastructure

**Categories Description:**

| **Category** | **Maximum Computing Time (C)** | **Maximum Deal Time (D)** |
| ------------ | ------------------------------ | ------------------------- |
| 0 – XS       | 5 min                          | 50 min                    |
| 1 – S        | 20 min                         | 200 min (3h20m)           |
| 2 – M        | 1 hour                         | 10h                       |
| 3 – L        | 3 hour                         | 30h (1d6h)                |
| 4 – XL       | 10 hour                        | 100h (4d4h)               |

- Each worker will allocate **C** minutes to compute the application. If the
  computation is not completed within this **Maximum Computing Time**, the
  running application will be stopped.
- From a buyer perspective, a requester will be able to claim a task of a deal
  after **D** minutes if the task is not completed within the **Maximum Deal
  Time**.
